#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

function resources(state, type) {
  return state.resources.filter((resource) => resource.type === type)
}

function attributes(resource) {
  return resource.instances?.[0]?.attributes ?? {}
}

const args = parseArgs(process.argv.slice(2))
for (const key of ['run-dir', 'state-file']) if (!args[key]) fail(`--${key} is required`)

const runDirectory = resolve(args['run-dir'])
const state = JSON.parse(readFileSync(resolve(args['state-file']), 'utf8'))
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const backupScript = resolve(scriptDirectory, 'backup-s3')
const keys = new Map(
  resources(state, 'aws_iam_access_key').map((resource) => [resource.name, attributes(resource)]),
)

for (const resource of resources(state, 'aws_s3_bucket')) {
  const bucket = attributes(resource)
  const key = keys.get(resource.name)
  if (!key?.id || !key?.secret) fail(`missing local credentials for ${resource.name}`)
  const versioningStatus = bucket.versioning?.[0]?.enabled ? 'Enabled' : 'Disabled'
  execFileSync(
    backupScript,
    [
      '--run-dir',
      runDirectory,
      '--site',
      resource.name,
      '--bucket',
      bucket.bucket,
      '--versioning-status',
      versioningStatus,
    ],
    {
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: key.id,
        AWS_SECRET_ACCESS_KEY: key.secret,
        AWS_DEFAULT_REGION: bucket.region,
        AWS_EC2_METADATA_DISABLED: 'true',
        AWS_PAGER: '',
      },
      encoding: 'utf8',
      stdio: ['ignore', 'inherit', 'inherit'],
    },
  )
}
