import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

type JsonObject = Record<string, unknown>
type ExportFile = {
  entities: {
    collectionVersions: Record<string, JsonObject[]>
    collections: Record<string, JsonObject[]>
    globals: Record<string, JsonObject>
  }
  site: string
}

const [sourceArg, targetArg] = process.argv.slice(2)
if (!sourceArg || !targetArg) throw new Error('Usage: compare-payload-exports.ts <source> <target>')

const readExport = async (file: string) =>
  JSON.parse(await readFile(path.resolve(file), 'utf8')) as ExportFile

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonObject)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, canonicalize(nestedValue)]),
    )
  }
  return value
}

const hash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')

const normalizeUpload = (doc: JsonObject) => {
  const { thumbnailURL: _thumbnailURL, url: _url, ...normalized } = structuredClone(doc)
  if (normalized.sizes && typeof normalized.sizes === 'object') {
    for (const size of Object.values(normalized.sizes as JsonObject)) {
      if (size && typeof size === 'object') delete (size as JsonObject).url
    }
  }
  return normalized
}

const normalizeCollection = (slug: string, doc: JsonObject) => {
  const normalized = slug === 'media' || slug === 'blog-image' ? normalizeUpload(doc) : doc
  if (slug === 'works') {
    const work = structuredClone(normalized)
    for (const key of ['video', 'videoPoster']) {
      if (work[key] === null) delete work[key]
    }
    return work
  }
  if (slug !== 'blog') return normalized
  const { updatedAt: _updatedAt, ...blog } = normalized
  return blog
}

const normalizeVersion = (entry: JsonObject) => {
  const version = structuredClone(entry.version as JsonObject)
  delete version.updatedAt
  return { parent: entry.parent, version }
}

const normalizeGlobal = (global: JsonObject) => {
  const normalized = structuredClone(global)
  for (const key of ['createdAt', 'globalType', 'id', 'updatedAt']) delete normalized[key]
  for (const [key, value] of Object.entries(normalized)) {
    if (value === null) delete normalized[key]
  }
  return normalized
}

const source = await readExport(sourceArg)
const target = await readExport(targetArg)
if (source.site !== target.site) throw new Error('Export sites do not match')

const results: Record<string, { count: number; sha256: string }> = {}
const failures: string[] = []

for (const [slug, sourceDocs] of Object.entries(source.entities.collections)) {
  const targetDocs = target.entities.collections[slug] ?? []
  const expected = sourceDocs.map((doc) => normalizeCollection(slug, doc))
  const actual = targetDocs.map((doc) => normalizeCollection(slug, doc))
  results[`collection:${slug}`] = { count: actual.length, sha256: hash(actual) }
  if (hash(expected) !== hash(actual)) failures.push(`collection:${slug}`)
}

for (const [slug, sourceVersions] of Object.entries(source.entities.collectionVersions)) {
  const targetVersions = target.entities.collectionVersions[slug] ?? []
  const expected = sourceVersions.map(normalizeVersion)
  const actual = targetVersions.map(normalizeVersion)
  results[`versions:${slug}`] = { count: actual.length, sha256: hash(actual) }
  if (hash(expected) !== hash(actual)) failures.push(`versions:${slug}`)
}

for (const [slug, sourceGlobal] of Object.entries(source.entities.globals)) {
  const expected = normalizeGlobal(sourceGlobal)
  const actual = normalizeGlobal(target.entities.globals[slug] ?? {})
  results[`global:${slug}`] = { count: 1, sha256: hash(actual) }
  if (hash(expected) !== hash(actual)) failures.push(`global:${slug}`)
}

console.log(JSON.stringify({ failures, results, site: source.site }))
if (failures.length > 0) process.exit(1)
