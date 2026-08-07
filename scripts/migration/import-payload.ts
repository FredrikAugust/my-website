import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload, type Config, type Payload } from 'payload'

type Site = 'claire' | 'fredrik'
type JsonObject = Record<string, unknown>
type ExportFile = {
  entities: {
    collectionVersions: Record<string, JsonObject[]>
    collections: Record<string, JsonObject[]>
    globals: Record<string, JsonObject>
  }
  format: number
  site: Site
}

const [siteArg, inputArg] = process.argv.slice(2)

if ((siteArg !== 'fredrik' && siteArg !== 'claire') || !inputArg) {
  throw new Error('Usage: import-payload.ts <fredrik|claire> <canonical-export>')
}

const site = siteArg as Site
const collectionOrder: Record<Site, string[]> = {
  fredrik: ['blog-image', 'guestbook-entry', 'blog'],
  claire: ['media', 'works'],
}

const withoutGeneratedUploadFields = (doc: JsonObject) => {
  const { thumbnailURL: _thumbnailURL, url: _url, ...data } = structuredClone(doc)
  if (data.sizes && typeof data.sizes === 'object') {
    for (const size of Object.values(data.sizes as JsonObject)) {
      if (size && typeof size === 'object') delete (size as JsonObject).url
    }
  }
  return data
}

const replayVersions = async (
  payload: Payload,
  collection: string,
  versions: JsonObject[],
) => {
  const byParent = Map.groupBy(versions, (entry) => String(entry.parent))

  for (const parentVersions of byParent.values()) {
    const ordered = parentVersions.toSorted((left, right) => {
      const dateOrder = String(left.createdAt).localeCompare(String(right.createdAt))
      return dateOrder || Number(left.id) - Number(right.id)
    })
    const parent = ordered[0]?.parent

    for (const [index, sourceVersion] of ordered.entries()) {
      const version = sourceVersion.version as JsonObject
      const data = { ...version, id: parent }
      const draft = version._status === 'draft'

      if (index === 0) {
        await payload.create({
          collection: collection as never,
          data: data as never,
          draft,
          overrideAccess: true,
        })
      } else {
        await payload.update({
          collection: collection as never,
          data: version as never,
          draft,
          id: parent as never,
          overrideAccess: true,
        })
      }
    }
  }
}

const main = async () => {
  const input = JSON.parse(await readFile(path.resolve(inputArg), 'utf8')) as ExportFile
  if (input.format !== 1 || input.site !== site) throw new Error('Canonical export does not match site')

  const configPath = path.resolve(process.cwd(), 'apps', site, 'src/payload.config.ts')
  const configModule = (await import(configPath)) as { default: Promise<Config> }
  const payload = await getPayload({ config: configModule.default })
  const imported: Record<string, number> = {}

  try {
    for (const collection of collectionOrder[site]) {
      const versions = input.entities.collectionVersions[collection] ?? []
      if (versions.length > 0) {
        await replayVersions(payload, collection, versions)
        imported[`${collection}:versions`] = versions.length
        imported[collection] = new Set(versions.map(({ parent }) => String(parent))).size
        continue
      }

      const docs = input.entities.collections[collection] ?? []
      for (const doc of docs) {
        await payload.create({
          collection: collection as never,
          data: withoutGeneratedUploadFields(doc) as never,
          overrideAccess: true,
        })
      }
      imported[collection] = docs.length
    }

    for (const [slug, doc] of Object.entries(input.entities.globals)) {
      const { globalType: _globalType, id: _id, ...data } = doc
      await payload.updateGlobal({
        data: data as never,
        overrideAccess: true,
        slug: slug as never,
      })
      imported[`global:${slug}`] = 1
    }

    console.log(JSON.stringify({ imported, site }))
  } finally {
    await payload.destroy()
  }
}

await main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
process.exit(0)
