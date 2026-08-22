import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

type Entry = {
  sourceId: number
  sourceSlug: string
  destination: 'dance' | 'exhibitions' | 'films' | 'installations'
  destinationSlug: string
}
type Mapping = { homepageSelection: string[]; records: Entry[] }

const mappingArg = process.argv[2]
if (!mappingArg)
  throw new Error('Usage: payload run scripts/verify-portfolio-migration.ts <mapping.json>')
const mapping = JSON.parse(await readFile(path.resolve(mappingArg), 'utf8')) as Mapping
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const id = (value: unknown) =>
  typeof value === 'object' && value && 'id' in value ? Number(value.id) : Number(value)
const sameJson = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)

try {
  const results = []
  for (const entry of mapping.records) {
    const source = await payload.findByID({ collection: 'works', id: entry.sourceId, depth: 0 })
    if (source.slug !== entry.sourceSlug)
      throw new Error(`Legacy source mismatch for ${entry.sourceSlug}`)
    if (entry.destination === 'dance') {
      const dance = await payload.findGlobal({ slug: 'dance', depth: 0 })
      const stageWork = dance.selectedStageWorks?.find(({ anchor }) => anchor === source.slug)
      if (!stageWork || stageWork.title !== source.title)
        throw new Error(`Dance migration mismatch for ${source.slug}`)
      results.push({ source: source.slug, destination: 'dance', verified: true })
      continue
    }

    const found = await payload.find({
      collection: entry.destination,
      where: { slug: { equals: entry.destinationSlug } },
      limit: 2,
      depth: 0,
      overrideAccess: true,
    })
    if (found.totalDocs !== 1)
      throw new Error(`Expected one ${entry.destination} record for ${entry.destinationSlug}`)
    const destination = found.docs[0]!
    if (destination.title !== source.title || destination.slug !== entry.destinationSlug)
      throw new Error(`Title or slug mismatch for ${source.slug}`)
    if (id(destination.heroImage) !== id(source.heroImage ?? source.videoPoster))
      throw new Error(`Hero media mismatch for ${source.slug}`)
    const destinationDescription =
      'overview' in destination ? destination.overview : destination.description
    if (!sameJson(destinationDescription, source.description))
      throw new Error(`Rich text mismatch for ${source.slug}`)
    const destinationCredits = destination.credits?.map(({ name, role }) => ({ name, role })) ?? []
    const sourceCredits = source.collaborators?.map(({ name, role }) => ({ name, role })) ?? []
    if (!sameJson(destinationCredits, sourceCredits))
      throw new Error(`Credits mismatch for ${source.slug}`)
    results.push({
      source: source.slug,
      destination: `${entry.destination}:${destination.slug}`,
      verified: true,
    })
  }

  const home = await payload.findGlobal({ slug: 'home', depth: 1 })
  const featured =
    home.featuredProjects?.map(
      ({ relationTo, value }) => `${relationTo}:${typeof value === 'object' ? value.slug : value}`,
    ) ?? []
  if (!sameJson(featured, mapping.homepageSelection))
    throw new Error('Homepage featured order differs from the approved mapping')

  console.log(
    JSON.stringify({ verified: true, legacyWorksRetained: 6, records: results, featured }),
  )
} finally {
  await payload.destroy()
}
