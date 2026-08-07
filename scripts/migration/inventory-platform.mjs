#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || !value) fail(`invalid argument: ${key ?? ''}`)
    values[key.slice(2)] = value
  }
  return values
}

function runJson(command, args, options = {}) {
  const stdout = execFileSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', options.quiet ? 'pipe' : 'inherit'],
  })
  return JSON.parse(stdout)
}

function tryRunJson(command, args, options = {}) {
  try {
    return runJson(command, args, { ...options, quiet: true })
  } catch {
    return null
  }
}

function envKeys(file) {
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)?.[1])
    .filter(Boolean)
    .sort()
}

function stateResources(state, type) {
  return state.resources.filter((resource) => resource.type === type)
}

function firstAttributes(resource) {
  return resource.instances?.[0]?.attributes ?? {}
}

function awsJson(credentials, args, quiet = false) {
  return runJson('aws', args, {
    env: {
      ...process.env,
      AWS_ACCESS_KEY_ID: credentials.id,
      AWS_SECRET_ACCESS_KEY: credentials.secret,
      AWS_DEFAULT_REGION: credentials.region,
      AWS_EC2_METADATA_DISABLED: 'true',
      AWS_PAGER: '',
    },
    quiet,
  })
}

function tryAwsJson(credentials, args) {
  try {
    return awsJson(credentials, args, true)
  } catch {
    return null
  }
}

async function cloudflareJson(token, path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json()
  if (!response.ok || payload.success === false) {
    throw new Error(`Cloudflare request failed for ${path}: ${response.status}`)
  }
  return payload.result
}

const args = parseArgs(process.argv.slice(2))
const required = ['run-dir', 'state-file', 'fredrik-repo', 'claire-repo']
for (const key of required) if (!args[key]) fail(`--${key} is required`)

const runDirectory = resolve(args['run-dir'])
const stateFile = resolve(args['state-file'])
const fredrikRepo = resolve(args['fredrik-repo'])
const claireRepo = resolve(args['claire-repo'])
if (!existsSync(resolve(runDirectory, 'run.json'))) fail(`not a migration run: ${runDirectory}`)
if (!existsSync(stateFile)) fail(`state file does not exist: ${stateFile}`)

const inventoryDirectory = resolve(runDirectory, 'inventory')
const outputFile = resolve(inventoryDirectory, 'platform.json')
if (existsSync(outputFile)) fail(`refusing to overwrite: ${outputFile}`)
mkdirSync(inventoryDirectory, { recursive: true, mode: 0o700 })

const state = JSON.parse(readFileSync(stateFile, 'utf8'))

const neonProjectResponse = runJson('neon', [
  'projects',
  'list',
  '--output',
  'json',
  '--no-analytics',
])
const neonProjects = []
for (const project of neonProjectResponse.projects ?? []) {
  const projectId = project.id
  const branchResponse = runJson('neon', [
    'branches',
    'list',
    '--project-id',
    projectId,
    '--output',
    'json',
    '--no-analytics',
  ])
  const branches = []
  for (const branch of branchResponse.branches ?? branchResponse ?? []) {
    const branchId = branch.id
    const databases = runJson('neon', [
      'databases',
      'list',
      '--project-id',
      projectId,
      '--branch',
      branchId,
      '--output',
      'json',
      '--no-analytics',
    ])
    const roles = runJson('neon', [
      'roles',
      'list',
      '--project-id',
      projectId,
      '--branch',
      branchId,
      '--output',
      'json',
      '--no-analytics',
    ])
    branches.push({ ...branch, databases, roles })
  }
  neonProjects.push({
    id: project.id,
    name: project.name,
    orgId: project.org_id,
    regionId: project.region_id,
    pgVersion: project.pg_version,
    syntheticStorageSize: project.synthetic_storage_size,
    activeTime: project.active_time,
    cpuUsedSeconds: project.cpu_used_sec,
    quotaResetAt: project.quota_reset_at,
    historyRetentionSeconds: project.history_retention_seconds,
    defaultEndpointSettings: project.default_endpoint_settings,
    branches,
  })
}

const vercelProjects = runJson('vercel', ['project', 'ls', '--format=json'], { cwd: fredrikRepo })
const vercelApplications = []
for (const repository of [fredrikRepo, claireRepo]) {
  const link = JSON.parse(readFileSync(resolve(repository, '.vercel/project.json'), 'utf8'))
  const environmentVariables = runJson('vercel', ['env', 'ls', '--format=json'], {
    cwd: repository,
  })
  vercelApplications.push({
    repository,
    projectId: link.projectId,
    projectName: link.projectName,
    orgId: link.orgId,
    environmentVariables,
  })
}

const accessKeys = new Map(
  stateResources(state, 'aws_iam_access_key').map((resource) => {
    const attributes = firstAttributes(resource)
    return [resource.name, { id: attributes.id, secret: attributes.secret }]
  }),
)
const awsBuckets = []
for (const resource of stateResources(state, 'aws_s3_bucket')) {
  const attributes = firstAttributes(resource)
  const accessKey = accessKeys.get(resource.name)
  if (!accessKey?.id || !accessKey?.secret) fail(`missing AWS credentials for ${resource.name}`)
  const credentials = { ...accessKey, region: attributes.region }
  const versioning = tryAwsJson(credentials, [
    's3api',
    'get-bucket-versioning',
    '--bucket',
    attributes.bucket,
    '--output',
    'json',
  ])
  const versionListing = tryAwsJson(credentials, [
    's3api',
    'list-object-versions',
    '--bucket',
    attributes.bucket,
    '--output',
    'json',
  ])
  const currentListing = versionListing
    ? null
    : awsJson(credentials, [
        's3api',
        'list-objects-v2',
        '--bucket',
        attributes.bucket,
        '--output',
        'json',
      ])
  const listing = versionListing ?? currentListing
  const objects = versionListing ? (listing.Versions ?? []) : (listing.Contents ?? [])
  awsBuckets.push({
    name: attributes.bucket,
    region: attributes.region,
    versioning: versioning?.Status ?? 'Unknown: GetBucketVersioning denied',
    versionListingAvailable: Boolean(versionListing),
    objectVersions: objects.map((object) => ({
      key: object.Key,
      versionId: object.VersionId ?? null,
      isLatest: object.IsLatest ?? true,
      size: object.Size,
      etag: object.ETag,
      lastModified: object.LastModified,
    })),
    deleteMarkers: (listing.DeleteMarkers ?? []).map((marker) => ({
      key: marker.Key,
      versionId: marker.VersionId,
      isLatest: marker.IsLatest,
      lastModified: marker.LastModified,
    })),
    objectVersionCount: objects.length,
    totalVersionBytes: objects.reduce((total, object) => total + Number(object.Size ?? 0), 0),
  })
}

const wranglerAuth = runJson('pnpm', [
  'dlx',
  'wrangler@latest',
  'auth',
  'token',
  '--json',
])
const cloudflareToken = wranglerAuth.token
if (!cloudflareToken) fail('Wrangler did not return an OAuth token')
const cloudflareAccounts = await cloudflareJson(cloudflareToken, '/accounts?per_page=50')
const zones = await cloudflareJson(cloudflareToken, '/zones?per_page=50')
const cloudflareZones = []
for (const zone of zones) {
  let dnsRecords = []
  let dnsRecordsAccess = true
  try {
    dnsRecords = await cloudflareJson(
      cloudflareToken,
      `/zones/${encodeURIComponent(zone.id)}/dns_records?per_page=100`,
    )
  } catch {
    dnsRecordsAccess = false
  }
  cloudflareZones.push({
    id: zone.id,
    name: zone.name,
    status: zone.status,
    plan: zone.plan?.name,
    nameServers: zone.name_servers,
    dnsRecordsAccess,
    dnsRecords: dnsRecords.map((record) => ({
      id: record.id,
      type: record.type,
      name: record.name,
      content: record.content,
      proxied: record.proxied,
      ttl: record.ttl,
    })),
  })
}
const cloudflareR2 = []
for (const account of cloudflareAccounts) {
  const result = await cloudflareJson(
    cloudflareToken,
    `/accounts/${encodeURIComponent(account.id)}/r2/buckets`,
  )
  cloudflareR2.push({
    account: { id: account.id, name: account.name },
    buckets: result.buckets ?? result,
  })
}

const stateInventory = state.resources.map((resource) => ({
  address: `${resource.type}.${resource.name}`,
  instances: resource.instances?.length ?? 0,
}))

const inventory = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  containsSecrets: false,
  credentialLocations: [
    { file: resolve(fredrikRepo, '.env.local'), keys: envKeys(resolve(fredrikRepo, '.env.local')) },
    { file: resolve(claireRepo, '.env.local'), keys: envKeys(resolve(claireRepo, '.env.local')) },
    { file: stateFile, stateResources: stateInventory.map((item) => item.address) },
    { provider: 'neon', location: '~/.config/neon' },
    { provider: 'vercel', location: 'Vercel CLI credential store and project environment store' },
    { provider: 'cloudflare', location: 'macOS Keychain-backed Wrangler OAuth profile' },
  ],
  neon: { projects: neonProjects },
  aws: { buckets: awsBuckets },
  vercel: { projects: vercelProjects, applications: vercelApplications },
  cloudflare: {
    accounts: cloudflareAccounts.map((account) => ({ id: account.id, name: account.name })),
    zones: cloudflareZones,
    r2: cloudflareR2,
  },
  state: { resources: stateInventory },
}

writeFileSync(outputFile, `${JSON.stringify(inventory, null, 2)}\n`, {
  encoding: 'utf8',
  mode: 0o600,
  flag: 'wx',
})
console.log(outputFile)
