import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

type Destination = 'dance' | 'exhibitions' | 'films' | 'installations'
type MappingRecord = {
  sourceId: number
  sourceSlug: string
  destination: Destination
  destinationSlug: string
  city?: string
}
type Mapping = {
  homepageSelection: string[]
  records: MappingRecord[]
}

const mappingArg = process.argv[2]
if (!mappingArg)
  throw new Error('Usage: payload run scripts/migrate-portfolio-content.ts <mapping.json>')

const mapping = JSON.parse(await readFile(path.resolve(mappingArg), 'utf8')) as Mapping
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const relationId = (value: number | { id: number } | null | undefined): number | null =>
  typeof value === 'object' && value ? value.id : (value ?? null)
const requiredRelationId = (value: number | { id: number }) => relationId(value) as number

const migrateProject = async (entry: MappingRecord) => {
  if (entry.destination === 'dance') return null

  const source = await payload.findByID({ collection: 'works', id: entry.sourceId, depth: 0 })
  const existing = await payload.find({
    collection: entry.destination,
    where: { slug: { equals: entry.destinationSlug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0]

  const credits = source.collaborators?.map(({ name, role }) => ({ name, role })) ?? []
  const heroSource = source.heroImage ?? source.videoPoster
  const thumbnailSource = source.thumbnailImage ?? source.videoPoster ?? source.heroImage
  if (!heroSource || !thumbnailSource) {
    throw new Error(`Approved project ${source.slug} has no usable hero or thumbnail media.`)
  }
  const shared = {
    title: source.title,
    slug: entry.destinationSlug,
    generateSlug: false,
    featured: source.featured,
    sortOrder: source.sortOrder,
    heroImage: requiredRelationId(heroSource),
    thumbnailImage: requiredRelationId(thumbnailSource),
    video: relationId(source.video),
    videoPoster: relationId(source.videoPoster),
    vimeoUrl: source.vimeoUrl,
    _status: 'published' as const,
  }

  if (entry.destination === 'exhibitions') {
    return payload.create({
      collection: 'exhibitions',
      draft: false,
      data: {
        ...shared,
        overview: source.description!,
        venue: source.venue || 'Venue to confirm',
        city: entry.city || source.venueLocation?.split(',')[0] || 'City to confirm',
        dateLabel: String(source.year),
        documentation:
          source.gallery?.map(({ image, caption }) => ({
            image: requiredRelationId(image),
            caption,
          })) ?? [],
        credits,
        includedInstallations: [],
      },
    })
  }

  if (entry.destination === 'films') {
    return payload.create({
      collection: 'films',
      draft: false,
      data: {
        ...shared,
        year: source.year,
        description: source.description!,
        duration: source.duration,
        credits,
        screenings:
          source.screenings?.map(({ festival, location, year }) => ({
            festival,
            location,
            year,
          })) ?? [],
        stills:
          source.gallery?.map(({ image, caption }) => ({
            image: requiredRelationId(image),
            caption,
          })) ?? [],
      },
    })
  }

  throw new Error(`No approved source record maps to ${entry.destination}`)
}

try {
  const migrated = new Map<string, Awaited<ReturnType<typeof migrateProject>>>()
  for (const entry of mapping.records) {
    const result = await migrateProject(entry)
    if (result) migrated.set(`${entry.destination}:${entry.destinationSlug}`, result)
  }

  const danceEntry = mapping.records.find(({ destination }) => destination === 'dance')
  if (danceEntry) {
    const currentDance = await payload.findGlobal({ slug: 'dance', depth: 0, overrideAccess: true })
    if (!currentDance.selectedStageWorks?.length) {
      const [source, oldPerformance] = await Promise.all([
        payload.findByID({ collection: 'works', id: danceEntry.sourceId, depth: 0 }),
        payload.findGlobal({ slug: 'performance-page', depth: 0, overrideAccess: true }),
      ])
      await payload.updateGlobal({
        slug: 'dance',
        data: {
          heading: 'Dance',
          introduction: oldPerformance.backgroundContent ?? source.description,
          selectedStageWorks: [
            {
              title: source.title,
              anchor: source.slug,
              companyOrVenue: source.venue,
              role: source.medium,
              dateOrYear: String(source.year),
              image: relationId(source.heroImage),
              description: source.description,
              video: relationId(source.video),
              videoPoster: relationId(source.videoPoster),
              vimeoUrl: source.vimeoUrl,
              credits: [
                ...(source.collaborators?.map(({ name, role }) => ({ name, role })) ?? []),
                ...(source.performers?.map(({ name }) => ({ name, role: 'Performer' })) ?? []),
              ],
            },
          ],
        },
      })
    }
  }

  const featuredProjects = mapping.homepageSelection.map((key) => {
    const [relationTo, slug] = key.split(':') as ['exhibitions' | 'films' | 'installations', string]
    const project = migrated.get(key)
    if (!project) throw new Error(`Featured project is unavailable after migration: ${slug}`)
    return { relationTo, value: project.id }
  })
  await payload.updateGlobal({ slug: 'home', data: { featuredProjects } })

  console.log(`Migrated ${migrated.size} projects and updated Home and Dance.`)
} finally {
  await payload.destroy()
}
