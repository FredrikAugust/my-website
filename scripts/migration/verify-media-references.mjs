import { readFile } from 'node:fs/promises'

const [site, canonicalPath, manifestPath, publicURL] = process.argv.slice(2)
if (!['fredrik', 'claire'].includes(site) || !canonicalPath || !manifestPath || !publicURL) {
  throw new Error('Usage: verify-media-references.mjs <fredrik|claire> <canonical> <manifest> <public-url>')
}

const canonical = JSON.parse(await readFile(canonicalPath, 'utf8'))
const manifest = (await readFile(manifestPath, 'utf8'))
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))
const manifestKeys = new Set(manifest.map(({ key }) => key))
const slug = site === 'fredrik' ? 'blog-image' : 'media'
const defaultPrefix = site === 'fredrik' ? 'blog-uploads' : 'claire-media-uploads'
const allMedia = canonical.entities.collections[slug]
const referencedIDs = new Set()
if (site === 'claire') {
  const add = (value) => {
    if (typeof value === 'number') referencedIDs.add(value)
  }
  for (const work of canonical.entities.collections.works) {
    for (const field of ['heroImage', 'thumbnailImage', 'video', 'videoPoster']) add(work[field])
    for (const item of work.gallery || []) add(item.image)
    for (const item of work.files || []) add(item.file)
  }
  const { home, about } = canonical.entities.globals
  add(home?.hero?.video)
  add(home?.hero?.fallbackImage)
  add(about?.portrait)
}
const selectedMedia = site === 'claire' ? allMedia.filter(({ id }) => referencedIDs.has(id)) : allMedia
const references = selectedMedia.flatMap((doc) => {
  const prefix = doc.prefix || defaultPrefix
  const files = [{ filename: doc.filename, mimeType: doc.mimeType }]
  for (const size of Object.values(doc.sizes || {})) files.push(size)
  return files.map(({ filename, mimeType }) => ({
    key: `${prefix}/${filename}`,
    mimeType,
  }))
})

for (const { key } of references) {
  if (!manifestKeys.has(key)) throw new Error(`Database media reference is absent from the frozen manifest: ${key}`)
}

let cursor = 0
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (cursor < references.length) {
      const { key, mimeType } = references[cursor++]
      const url = `${publicURL.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`
      const response = await fetch(url, { headers: { Range: 'bytes=0-0' } })
      if (response.status !== 206) throw new Error(`Public media range check failed (${response.status}): ${key}`)
      if (!response.headers.get('content-range')) throw new Error(`Missing Content-Range: ${key}`)
      if (mimeType && response.headers.get('content-type') !== mimeType) {
        throw new Error(`Content-Type mismatch: ${key}`)
      }
      await response.body?.cancel()
    }
  }),
)

const types = Object.fromEntries(
  [...new Set(references.map(({ mimeType }) => mimeType))].sort().map((type) => [
    type,
    references.filter(({ mimeType }) => mimeType === type).length,
  ]),
)
const staleUnreferencedRecords = allMedia.filter(({ id, prefix, filename }) => {
  if (referencedIDs.has(id)) return false
  return !manifestKeys.has(`${prefix || defaultPrefix}/${filename}`)
}).length
console.log(
  JSON.stringify({
    site,
    referencedMediaRecords: selectedMedia.length,
    referencedObjects: references.length,
    staleUnreferencedRecords,
    types,
    parity: true,
  }),
)
