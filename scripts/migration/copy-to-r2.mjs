import { createHash } from 'node:crypto'
import { createReadStream, readFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const values = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

for (const required of ['manifest', 'bucket', 'endpoint', 'public-url']) {
  if (!values[required]) throw new Error(`Missing --${required}=...`)
}
const useWrangler = values.wrangler === 'true'
if (!useWrangler && (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
  throw new Error('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to the bucket-scoped R2 credentials.')
}

const entries = readFileSync(values.manifest, 'utf8')
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
const objectDir = path.dirname(values.manifest)
const publicBase = values['public-url'].replace(/\/$/, '')
const cacheControl = 'public, max-age=31536000, immutable'

function aws(args, { allowFailure = false } = {}) {
  const result = spawnSync(
    'aws',
    [...args, '--endpoint-url', values.endpoint, '--region', 'auto', '--output', 'json'],
    { encoding: 'utf8' },
  )
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`R2 command failed for ${args[0]} (credentials and object names were not logged).`)
  }
  return result
}

async function hashFile(filename) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filename)) hash.update(chunk)
  return hash.digest('hex')
}

async function hashPublicObject(key) {
  const url = `${publicBase}/${key.split('/').map(encodeURIComponent).join('/')}?verify=${Date.now()}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok || !response.body) throw new Error(`Public object check failed for ${key}: ${response.status}`)
  const hash = createHash('sha256')
  let size = 0
  for await (const chunk of response.body) {
    hash.update(chunk)
    size += chunk.length
  }
  return { hash: hash.digest('hex'), size, headers: response.headers }
}

async function existingPublicObject(key) {
  try {
    return await hashPublicObject(key)
  } catch (error) {
    if (String(error).endsWith(': 404')) return null
    throw error
  }
}

function upload(entry, blob) {
  if (useWrangler) {
    const result = spawnSync(
      'pnpm',
      [
        'dlx',
        'wrangler',
        'r2',
        'object',
        'put',
        `${values.bucket}/${entry.key}`,
        '--file',
        blob,
        '--content-type',
        entry.response.ContentType || 'application/octet-stream',
        '--cache-control',
        cacheControl,
        '--remote',
        '--force',
      ],
      { encoding: 'utf8' },
    )
    if (result.status !== 0) throw new Error(`Wrangler upload failed: ${entry.key}`)
    return
  }

  aws([
    's3api',
    'put-object',
    '--bucket',
    values.bucket,
    '--key',
    entry.key,
    '--body',
    blob,
    '--content-type',
    entry.response.ContentType || 'application/octet-stream',
    '--cache-control',
    cacheControl,
  ])
}

let uploaded = 0
let reused = 0
let bytes = 0
let cursor = 0
const concurrency = Math.max(1, Math.min(Number(values.concurrency || 1), 8))

async function copyEntry(entry, index) {
  const blob = path.join(objectDir, 'blobs', entry.objectId)
  if ((await hashFile(blob)) !== entry.plaintextSha256) throw new Error(`Frozen blob hash mismatch: ${entry.key}`)

  const existing = await existingPublicObject(entry.key)
  if (existing) {
    if (existing.size !== entry.source.size || existing.hash !== entry.plaintextSha256) {
      throw new Error(`Destination already contains different bytes: ${entry.key}`)
    }
    reused += 1
  } else {
    upload(entry, blob)
    uploaded += 1
  }

  const publicObject = await hashPublicObject(entry.key)
  if (publicObject.size !== entry.source.size || publicObject.hash !== entry.plaintextSha256) {
    throw new Error(`R2 parity failed: ${entry.key}`)
  }
  bytes += publicObject.size
  console.log(`[${index + 1}/${entries.length}] verified ${entry.key}`)
}

await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (cursor < entries.length) {
      const index = cursor++
      await copyEntry(entries[index], index)
    }
  }),
)

const mp4 = entries.find((entry) => entry.response.ContentType === 'video/mp4')
if (mp4) {
  const url = `${publicBase}/${mp4.key.split('/').map(encodeURIComponent).join('/')}`
  const response = await fetch(url, { headers: { Range: 'bytes=0-1023' } })
  if (response.status !== 206 || !response.headers.get('content-range')) {
    throw new Error('MP4 origin did not honor a byte-range request.')
  }
}

console.log(JSON.stringify({ bucket: values.bucket, objects: entries.length, bytes, uploaded, reused, parity: true }))
