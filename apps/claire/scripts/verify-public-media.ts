import { createClient } from '@libsql/client'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [databaseArg, publicUrlArg, outputArg] = process.argv.slice(2)
if (!databaseArg || !publicUrlArg || !outputArg) {
  throw new Error(
    'Usage: payload run scripts/verify-public-media.ts <database.db> <public-url> <output.json>',
  )
}

const database = path.resolve(databaseArg)
const baseUrl = publicUrlArg.replace(/\/$/, '')
const client = createClient({ url: `file:${database}` })

try {
  const result = await client.execute(
    'SELECT id, prefix, filename, mime_type, filesize FROM media ORDER BY id',
  )
  const foreignKeys = await client.execute(
    "SELECT m.name AS table_name, fk.[from] AS column_name FROM sqlite_schema AS m JOIN pragma_foreign_key_list(m.name) AS fk WHERE m.type = 'table' AND fk.[table] = 'media'",
  )
  const referencedIds = new Set<number>()
  for (const row of foreignKeys.rows) {
    const table = String(row.table_name)
    const column = String(row.column_name)
    if (!/^[a-zA-Z0-9_]+$/.test(table) || !/^[a-zA-Z0-9_]+$/.test(column))
      throw new Error('Unexpected schema identifier')
    const references = await client.execute(
      `SELECT DISTINCT "${column}" AS id FROM "${table}" WHERE "${column}" IS NOT NULL`,
    )
    for (const reference of references.rows) referencedIds.add(Number(reference.id))
  }
  const expected = result.rows.map((row) => {
    const prefix = String(row.prefix || 'claire-media-uploads')
    const filename = String(row.filename)
    const key = `${prefix}/${filename}`
    const url = `${baseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`
    const id = Number(row.id)
    return {
      id,
      key,
      url,
      mimeType: row.mime_type,
      expectedBytes: Number(row.filesize),
      referenced: referencedIds.has(id),
    }
  })

  const objects = []
  for (let start = 0; start < expected.length; start += 8) {
    const batch = expected.slice(start, start + 8)
    objects.push(
      ...(await Promise.all(
        batch.map(async (item) => {
          const response = await fetch(item.url, { method: 'HEAD' })
          const contentLength = Number(response.headers.get('content-length')) || null
          return {
            ...item,
            status: response.status,
            contentLength,
            etag: response.headers.get('etag'),
            verified: response.ok && (!contentLength || contentLength === item.expectedBytes),
          }
        }),
      )),
    )
  }

  const failed = objects.filter((item) => !item.verified)
  const referencedFailed = failed.filter((item) => item.referenced)
  const output = path.resolve(outputArg)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(
    output,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), sourceDatabase: path.basename(database), baseUrl, objectCount: objects.length, expectedBytes: objects.reduce((sum, item) => sum + item.expectedBytes, 0), failedCount: failed.length, referencedFailedCount: referencedFailed.length, objects }, null, 2)}\n`,
    { mode: 0o600 },
  )
  if (referencedFailed.length)
    throw new Error(
      `${referencedFailed.length} referenced media objects failed public verification; see ${output}`,
    )
  console.log(
    `Verified ${objects.length - failed.length}/${objects.length} public media objects; ${failed.length} unreferenced objects are missing. Wrote ${output}`,
  )
} finally {
  client.close()
}
