import { existsSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@libsql/client'
import { config as loadEnv } from 'dotenv'

const [targetArg, envFileArg] = process.argv.slice(2)

if (!targetArg || !envFileArg) {
  throw new Error(
    'Usage: tsx scripts/copy-production-database.ts <target.db> <production-env-file>',
  )
}

const target = path.resolve(targetArg)
if (existsSync(target)) throw new Error(`Refusing to overwrite existing database: ${target}`)

loadEnv({ path: path.resolve(envFileArg), quiet: true, override: true })

const syncUrl = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!syncUrl || !authToken) throw new Error('Turso production credentials are unavailable')

const remote = createClient({ url: syncUrl, authToken })
const local = createClient({ url: `file:${target}` })

const tableCounts = async (
  client: ReturnType<typeof createClient>,
): Promise<Record<string, number>> => {
  const tables = await client.execute(
    "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  return Object.fromEntries(
    await Promise.all(
      tables.rows.map(async ({ name }) => {
        const table = String(name)
        if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error(`Unexpected table name: ${table}`)
        const result = await client.execute(`SELECT COUNT(*) AS count FROM "${table}"`)
        return [table, Number(result.rows[0]?.count ?? 0)]
      }),
    ),
  ) as Record<string, number>
}

try {
  const source = await remote.transaction('read')
  await local.execute('PRAGMA foreign_keys = OFF')
  const destination = await local.transaction('write')

  try {
    const schema = await source.execute(
      "SELECT type, name, sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 WHEN 'trigger' THEN 2 ELSE 3 END, name",
    )
    const tables = schema.rows.filter(({ type }) => type === 'table')

    for (const { sql } of tables) await destination.execute(String(sql))

    for (const { name } of tables) {
      const table = String(name)
      if (!/^[a-zA-Z0-9_]+$/.test(table)) throw new Error(`Unexpected table name: ${table}`)
      const rows = await source.execute(`SELECT * FROM "${table}"`)
      if (rows.rows.length === 0) continue

      const columnList = rows.columns.map((column) => `"${column}"`).join(', ')
      const placeholders = rows.columns.map(() => '?').join(', ')
      const insert = `INSERT INTO "${table}" (${columnList}) VALUES (${placeholders})`
      for (const row of rows.rows) {
        await destination.execute({ sql: insert, args: rows.columns.map((column) => row[column]) })
      }
    }

    for (const { sql, type } of schema.rows) {
      if (type !== 'table') await destination.execute(String(sql))
    }

    await destination.commit()
    source.close()
  } finally {
    destination.close()
    source.close()
  }

  const [remoteCounts, localCounts] = await Promise.all([tableCounts(remote), tableCounts(local)])

  if (JSON.stringify(remoteCounts) !== JSON.stringify(localCounts)) {
    throw new Error('Remote and local table counts differ after sync')
  }

  console.log(
    JSON.stringify({
      target,
      method: 'read transaction and logical SQLite copy',
      tables: Object.keys(localCounts).length,
      rows: Object.values(localCounts).reduce((total, count) => total + count, 0),
      tableCounts: localCounts,
    }),
  )
} finally {
  remote.close()
  local.close()
}
