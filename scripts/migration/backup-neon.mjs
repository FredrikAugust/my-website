#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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

function firstAttributes(resource) {
  return resource?.instances?.[0]?.attributes ?? {}
}

function stateResource(state, type, name) {
  return state.resources.find((resource) => resource.type === type && resource.name === name)
}

function stateEnvironmentValue(state, name) {
  return firstAttributes(stateResource(state, 'vercel_project_environment_variable', name)).value
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

function tableHash(uri, schemaName, tableName) {
  const schema = quoteIdentifier(schemaName)
  const table = quoteIdentifier(tableName)
  return execFileSync(
    'psql',
    [
      '--no-psqlrc',
      '--quiet',
      '--tuples-only',
      '--no-align',
      '--set',
      'ON_ERROR_STOP=1',
      '--dbname',
      uri,
      '--command',
      `SELECT md5(COALESCE(string_agg(row_hash, '' ORDER BY row_hash), '')) FROM (SELECT md5(row_to_json(source_row)::text) AS row_hash FROM ${schema}.${table} AS source_row) hashes;`,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  ).trim()
}

const args = parseArgs(process.argv.slice(2))
for (const key of ['run-dir', 'state-file', 'comparison']) {
  if (!args[key]) fail(`--${key} is required`)
}

const runDirectory = resolve(args['run-dir'])
const state = JSON.parse(readFileSync(resolve(args['state-file']), 'utf8'))
const comparison = JSON.parse(readFileSync(resolve(args.comparison), 'utf8'))
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const backupScript = resolve(scriptDirectory, 'backup-postgres')
if (!existsSync(backupScript)) fail(`backup script is missing: ${backupScript}`)

const websiteUris = {
  'production/fredrik_cms': {
    site: 'fredrik',
    uri: stateEnvironmentValue(state, 'fredrik_database_uri'),
  },
  'dev/fredrik_cms': {
    site: 'fredrik',
    uri: stateEnvironmentValue(state, 'fredrik_dev_database_uri'),
  },
  'production/claire_cms': {
    site: 'claire',
    uri: stateEnvironmentValue(state, 'claire_database_uri'),
  },
  'dev/claire_cms': {
    site: 'claire',
    uri: stateEnvironmentValue(state, 'claire_dev_database_uri'),
  },
}

for (const database of comparison.protectedScope.databases) {
  const key = `${database.branch}/${database.name}`
  const website = websiteUris[key]
  let site = website?.site
  let uri = website?.uri

  if (database.name === 'neondb') {
    site = 'neon-default'
    uri = execFileSync(
      'neon',
      [
        'connection-string',
        database.branchId,
        '--project-id',
        database.projectId,
        '--role-name',
        'neondb_owner',
        '--database-name',
        'neondb',
        '--ssl',
        'require',
        '--no-analytics',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
    ).trim()
  }

  if (!site || !uri) fail(`no connection source for ${key}`)
  const sourceId = `${site}--${database.branch}--${database.name}`
  const sourceDirectory = resolve(runDirectory, 'databases', sourceId)
  if (!existsSync(sourceDirectory)) {
    execFileSync(
      backupScript,
      [
        '--run-dir',
        runDirectory,
        '--site',
        site,
        '--branch',
        database.branch,
        '--database',
        database.name,
      ],
      {
        env: { ...process.env, DATABASE_URI: uri },
        encoding: 'utf8',
        stdio: ['ignore', 'inherit', 'inherit'],
      },
    )
  }

  const hashFile = resolve(sourceDirectory, 'table-hashes.jsonl')
  if (!existsSync(hashFile)) {
    const tables = readFileSync(resolve(sourceDirectory, 'table-rows.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
    const hashes = tables.map((table) => ({
      schema: table.schema,
      table: table.table,
      contentHash: tableHash(uri, table.schema, table.table),
    }))
    writeFileSync(hashFile, `${hashes.map((item) => JSON.stringify(item)).join('\n')}\n`, {
      encoding: 'utf8',
      mode: 0o600,
      flag: 'wx',
    })
  }
}
