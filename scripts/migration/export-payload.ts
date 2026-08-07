import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload, type Config, type Payload } from 'payload'

type Site = 'claire' | 'fredrik'
type JsonObject = Record<string, unknown>

const [siteArg, outputArg] = process.argv.slice(2)

if ((siteArg !== 'fredrik' && siteArg !== 'claire') || !outputArg) {
  throw new Error(
    'Usage: payload run scripts/migration/export-payload.ts <fredrik|claire> <output>',
  )
}

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

const compareIDs = (left: JsonObject, right: JsonObject) =>
  String(left.id ?? '').localeCompare(String(right.id ?? ''), undefined, { numeric: true })

const hash = (value: unknown) =>
  createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')

const authIdentity = (doc: JsonObject) =>
  Object.fromEntries(
    ['id', 'email', 'username', 'createdAt', 'updatedAt']
      .filter((key) => doc[key] !== undefined)
      .map((key) => [key, doc[key]]),
  )

const findAll = async (payloadClient: Payload, collection: string, draft: boolean) => {
  const result = await payloadClient.find({
    collection: collection as never,
    depth: 0,
    draft,
    joins: false,
    overrideAccess: true,
    pagination: false,
    showHiddenFields: false,
    sort: 'id',
  })
  return (result.docs as JsonObject[]).sort(compareIDs)
}

const main = async () => {
  const site = siteArg as Site
  const outputPath = path.resolve(outputArg)
  const configPath = path.resolve(process.cwd(), 'apps', site, 'src/payload.config.ts')
  const configModule = (await import(configPath)) as { default: Promise<Config> }
  const sourceConfig = await configModule.default
  const sourceManifests = {
    fredrik: {
      collections: ['users', 'blog', 'blog-image', 'guestbook-entry'],
      globals: [],
    },
    claire: {
      collections: ['users', 'media', 'works'],
      globals: [
        'home',
        'site-settings',
        'about',
        'cv',
        'contact',
        'performance-page',
        'film-page',
        'works-page',
      ],
    },
  } satisfies Record<Site, { collections: string[]; globals: string[] }>
  const sourceCollectionSlugs = new Set(sourceManifests[site].collections)
  const sourceGlobalSlugs = new Set(sourceManifests[site].globals)
  const payload = await getPayload({ config: sourceConfig })

  try {
    const collections: Record<string, JsonObject[]> = {}
    const collectionVersions: Record<string, JsonObject[]> = {}
    const globals: Record<string, JsonObject> = {}
    const globalVersions: Record<string, JsonObject[]> = {}
    const authIdentities: Record<string, JsonObject[]> = {}

    for (const collection of payload.config.collections.filter(({ slug }) =>
      sourceCollectionSlugs.has(slug),
    )) {
      const slug = collection.slug
      const docs = await findAll(payload, slug, Boolean(collection.versions?.drafts))

      if (collection.auth) {
        authIdentities[slug] = docs.map(authIdentity)
      } else {
        collections[slug] = docs
      }

      if (collection.versions) {
        const result = await payload.findVersions({
          collection: slug as never,
          depth: 0,
          overrideAccess: true,
          pagination: false,
          showHiddenFields: false,
          sort: 'id',
        })
        collectionVersions[slug] = (result.docs as JsonObject[]).sort(compareIDs)
      }
    }

    for (const global of payload.config.globals.filter(({ slug }) => sourceGlobalSlugs.has(slug))) {
      const slug = global.slug
      globals[slug] = (await payload.findGlobal({
        depth: 0,
        overrideAccess: true,
        showHiddenFields: false,
        slug: slug as never,
      })) as JsonObject

      if (global.versions) {
        const result = await payload.findGlobalVersions({
          depth: 0,
          overrideAccess: true,
          pagination: false,
          showHiddenFields: false,
          slug: slug as never,
          sort: 'id',
        })
        globalVersions[slug] = (result.docs as JsonObject[]).sort(compareIDs)
      }
    }

    const entities = { authIdentities, collections, collectionVersions, globals, globalVersions }
    const sections = Object.fromEntries(
      Object.entries(entities).map(([section, value]) => [
        section,
        {
          count: Object.values(value).reduce(
            (total, entity) => total + (Array.isArray(entity) ? entity.length : 1),
            0,
          ),
          entities: Object.fromEntries(
            Object.entries(value).map(([entity, records]) => [
              entity,
              {
                count: Array.isArray(records) ? records.length : 1,
                sha256: hash(records),
              },
            ]),
          ),
          sha256: hash(value),
        },
      ]),
    )

    const output = canonicalize({
      format: 1,
      site,
      source: 'verified-postgresql-17-restore',
      exclusions: [
        'auth secrets and sessions',
        'payload locks and caches',
        'migration ledgers',
        'provider credentials',
      ],
      sections,
      entities,
    })

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
    console.log(JSON.stringify({ outputPath, sections, site }))
  } finally {
    await payload.destroy()
  }
}

await main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
process.exit(0)
