#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

function firstAttributes(resource) {
  return resource?.instances?.[0]?.attributes ?? {}
}

function stateResource(state, type, name) {
  return state.resources.find((resource) => resource.type === type && resource.name === name)
}

function stateResources(state, type) {
  return state.resources.filter((resource) => resource.type === type)
}

function psqlJson(uri, sql) {
  const connection = new URL(uri)
  const database = decodeURIComponent(connection.pathname.replace(/^\//, ''))
  const output = execFileSync(
    'psql',
    ['--no-psqlrc', '--quiet', '--tuples-only', '--no-align', '--set', 'ON_ERROR_STOP=1', '--command', sql],
    {
      env: {
        ...process.env,
        PGHOST: connection.hostname,
        PGPORT: connection.port || '5432',
        PGUSER: decodeURIComponent(connection.username),
        PGPASSWORD: decodeURIComponent(connection.password),
        PGDATABASE: database,
        PGSSLMODE: connection.searchParams.get('sslmode') ?? 'require',
        PGCHANNELBINDING: connection.searchParams.get('channel_binding') ?? 'prefer',
      },
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  ).trim()
  return JSON.parse(output || 'null')
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

function fileSha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function asList(value, field) {
  if (Array.isArray(value)) return value
  return value?.[field] ?? []
}

const args = parseArgs(process.argv.slice(2))
for (const key of ['run-dir', 'state-file', 'inventory', 'legacy-dump']) {
  if (!args[key]) fail(`--${key} is required`)
}

const runDirectory = resolve(args['run-dir'])
const stateFile = resolve(args['state-file'])
const inventoryFile = resolve(args.inventory)
const legacyDump = resolve(args['legacy-dump'])
const outputFile = resolve(runDirectory, 'inventory/scope-comparison.json')
if (!existsSync(resolve(runDirectory, 'run.json'))) fail(`not a migration run: ${runDirectory}`)
if (existsSync(outputFile)) fail(`refusing to overwrite: ${outputFile}`)

const state = JSON.parse(readFileSync(stateFile, 'utf8'))
const inventory = JSON.parse(readFileSync(inventoryFile, 'utf8'))

const expectedDatabases = stateResources(state, 'neon_database').map((resource) => {
  const attributes = firstAttributes(resource)
  return { stateAddress: `neon_database.${resource.name}`, branchId: attributes.branch_id, name: attributes.name }
})
const expectedRoles = stateResources(state, 'neon_role').map((resource) => {
  const attributes = firstAttributes(resource)
  return { stateAddress: `neon_role.${resource.name}`, branchId: attributes.branch_id, name: attributes.name }
})

const liveDatabases = []
const liveRoles = []
for (const project of inventory.neon.projects) {
  for (const branch of project.branches) {
    for (const database of asList(branch.databases, 'databases')) {
      liveDatabases.push({ projectId: project.id, branchId: branch.id, branch: branch.name, name: database.name })
    }
    for (const role of asList(branch.roles, 'roles')) {
      liveRoles.push({ projectId: project.id, branchId: branch.id, branch: branch.name, name: role.name })
    }
  }
}

const undocumentedDatabases = liveDatabases.filter(
  (database) => !expectedDatabases.some((expected) => expected.branchId === database.branchId && expected.name === database.name),
)
const undocumentedRoles = liveRoles.filter(
  (role) => !expectedRoles.some((expected) => expected.branchId === role.branchId && expected.name === role.name),
)

const databaseUris = {
  'fredrik-production': firstAttributes(
    stateResource(state, 'vercel_project_environment_variable', 'fredrik_database_uri'),
  ).value,
  'fredrik-dev': firstAttributes(
    stateResource(state, 'vercel_project_environment_variable', 'fredrik_dev_database_uri'),
  ).value,
  'claire-production': firstAttributes(
    stateResource(state, 'vercel_project_environment_variable', 'claire_database_uri'),
  ).value,
  'claire-dev': firstAttributes(
    stateResource(state, 'vercel_project_environment_variable', 'claire_dev_database_uri'),
  ).value,
}

const candidateSql = `
  SELECT COALESCE(json_agg(row_to_json(candidate) ORDER BY candidate.schema_name, candidate.table_name), '[]'::json)
  FROM (
    SELECT
      table_schema AS schema_name,
      table_name,
      array_agg(column_name ORDER BY ordinal_position) FILTER (
        WHERE column_name ~* '(file|mime|url|media|image|video|poster|document|thumbnail)'
      ) AS reference_columns
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    GROUP BY table_schema, table_name
    HAVING table_name ~* '(media|image|video|document)'
      OR bool_or(column_name ~* '(file|mime|url|media|image|video|poster|document|thumbnail)')
  ) AS candidate;
`

const mediaReferences = []
for (const [source, uri] of Object.entries(databaseUris)) {
  if (!uri) fail(`database URI is missing from state for ${source}`)
  const current = psqlJson(uri, "SELECT json_build_object('database', current_database(), 'serverVersion', current_setting('server_version'));")
  const candidates = psqlJson(uri, candidateSql)
  const tables = []
  for (const candidate of candidates) {
    const schema = quoteIdentifier(candidate.schema_name)
    const table = quoteIdentifier(candidate.table_name)
    const rowCount = psqlJson(uri, `SELECT count(*)::int FROM ${schema}.${table};`)
    const columns = []
    for (const columnName of candidate.reference_columns ?? []) {
      const column = quoteIdentifier(columnName)
      const values = psqlJson(
        uri,
        `SELECT COALESCE(json_agg(value ORDER BY value), '[]'::json) FROM (SELECT DISTINCT ${column}::text AS value FROM ${schema}.${table} WHERE ${column} IS NOT NULL) refs;`,
      )
      columns.push({ name: columnName, values })
    }
    tables.push({ schema: candidate.schema_name, table: candidate.table_name, rowCount, columns })
  }
  mediaReferences.push({ source, database: current.database, serverVersion: current.serverVersion, tables })
}

const expectedBuckets = stateResources(state, 'aws_s3_bucket').map((resource) => {
  const attributes = firstAttributes(resource)
  return {
    stateAddress: `aws_s3_bucket.${resource.name}`,
    name: attributes.bucket,
    region: attributes.region,
    versioningEnabled: attributes.versioning?.[0]?.enabled ?? false,
  }
})
const liveBucketNames = inventory.aws.buckets.map((bucket) => bucket.name)
const liveVercelNames = inventory.vercel.projects.projects.map((project) => project.name)
const expectedVercelNames = stateResources(state, 'vercel_project').map(
  (resource) => firstAttributes(resource).name,
)
const liveZoneNames = inventory.cloudflare.zones.map((zone) => zone.name)
const expectedZoneNames = stateResources(state, 'cloudflare_zone').map(
  (resource) => firstAttributes(resource).name,
)

const comparison = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  containsSecrets: false,
  databaseComparison: {
    expected: expectedDatabases,
    live: liveDatabases,
    undocumentedLive: undocumentedDatabases,
    protectedScope: liveDatabases,
  },
  roleComparison: {
    expected: expectedRoles,
    live: liveRoles,
    undocumentedLive: undocumentedRoles,
  },
  objectStorageComparison: {
    expectedAwsBuckets: expectedBuckets,
    liveAwsBuckets: inventory.aws.buckets.map((bucket) => ({
      name: bucket.name,
      region: bucket.region,
      objectCount: bucket.objectVersionCount,
      bytes: bucket.totalVersionBytes,
      liveVersioningQuery: bucket.versioning,
      stateVersioningEnabled: expectedBuckets.find((expected) => expected.name === bucket.name)?.versioningEnabled,
    })),
    missingFromLive: expectedBuckets.filter((bucket) => !liveBucketNames.includes(bucket.name)),
    undocumentedLive: liveBucketNames.filter((name) => !expectedBuckets.some((bucket) => bucket.name === name)),
    existingR2ExcludedFromWebsiteScope: inventory.cloudflare.r2.flatMap((account) =>
      account.buckets.map((bucket) => ({ account: account.account.name, bucket: bucket.name })),
    ),
    protectedScope: expectedBuckets.map((bucket) => bucket.name),
  },
  vercelComparison: {
    expected: expectedVercelNames,
    live: liveVercelNames,
    missingFromLive: expectedVercelNames.filter((name) => !liveVercelNames.includes(name)),
    undocumentedLive: liveVercelNames.filter((name) => !expectedVercelNames.includes(name)),
  },
  cloudflareComparison: {
    expectedZones: expectedZoneNames,
    liveZones: liveZoneNames,
    missingFromLive: expectedZoneNames.filter((name) => !liveZoneNames.includes(name)),
    undocumentedLive: liveZoneNames.filter((name) => !expectedZoneNames.includes(name)),
    dnsRecordAccess: inventory.cloudflare.zones.every((zone) => zone.dnsRecordsAccess),
  },
  mediaReferences,
  existingMigrationEvidence: existsSync(legacyDump)
    ? { path: legacyDump, size: statSync(legacyDump).size, sha256: fileSha256(legacyDump) }
    : { path: legacyDump, missing: true },
  protectedScope: {
    databases: liveDatabases,
    buckets: expectedBuckets.map((bucket) => bucket.name),
    repositories: ['my-website', 'website-claire', 'personal-cluster'],
    legacyArtifacts: existsSync(legacyDump) ? [legacyDump] : [],
  },
}

writeFileSync(outputFile, `${JSON.stringify(comparison, null, 2)}\n`, {
  encoding: 'utf8',
  mode: 0o600,
  flag: 'wx',
})
console.log(outputFile)
