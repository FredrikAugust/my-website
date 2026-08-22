import { getPayload } from 'payload'

const databaseUrl = process.env.TURSO_DATABASE_URL
if (!databaseUrl?.startsWith('file:')) {
  throw new Error('Development seed refused: TURSO_DATABASE_URL must point to a local file.')
}

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
const adminEmail = process.env.LOCAL_ADMIN_EMAIL
const adminPassword = process.env.LOCAL_ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  throw new Error('Development seed refused: local admin credentials are not configured.')
}

const samples = [
  {
    title: 'The Table — Development Sample',
    slug: 'dev-table',
    year: 2026,
    shortDescription:
      'Development placeholder for testing an installation presented within Saudade.',
    materials: 'Wood, projected moving image — development placeholder',
    dimensions: 'Dimensions to be confirmed',
    heroImage: 36,
    thumbnailImage: 29,
    gallery: [{ image: 37 }, { image: 38 }],
    exhibitionSlug: 'saudade',
  },
  {
    title: 'The Washing Machine — Development Sample',
    slug: 'dev-washing-machine',
    year: 2026,
    shortDescription:
      'Development placeholder for testing an object-based moving-image installation.',
    materials: 'Washing machine, film, light — development placeholder',
    dimensions: 'Dimensions to be confirmed',
    heroImage: 39,
    thumbnailImage: 39,
    gallery: [{ image: 44 }, { image: 42 }],
    exhibitionSlug: 'on-repeat',
  },
  {
    title: 'Vanity — Development Sample',
    slug: 'dev-vanity',
    year: 2025,
    shortDescription:
      'Development placeholder for testing a related installation in Tides & Threads.',
    materials: 'Found furniture and moving image — development placeholder',
    dimensions: 'Dimensions to be confirmed',
    heroImage: 23,
    thumbnailImage: 24,
    gallery: [{ image: 25 }, { image: 26 }],
    exhibitionSlug: 'tides-and-threads',
  },
] as const

try {
  const localAdmins = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!localAdmins.docs[0]) {
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword },
      overrideAccess: true,
    })
  }

  for (const [sortOrder, sample] of samples.entries()) {
    const existing = await payload.find({
      collection: 'installations',
      where: { slug: { equals: sample.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const installation =
      existing.docs[0] ??
      (await payload.create({
        collection: 'installations',
        draft: false,
        data: {
          title: sample.title,
          slug: sample.slug,
          generateSlug: false,
          year: sample.year,
          shortDescription: sample.shortDescription,
          materials: sample.materials,
          dimensions: sample.dimensions,
          heroImage: sample.heroImage,
          thumbnailImage: sample.thumbnailImage,
          gallery: [...sample.gallery],
          credits: [{ name: 'Development fixture', role: 'Placeholder content only' }],
          sortOrder,
          _status: 'published',
        },
      }))

    const exhibitions = await payload.find({
      collection: 'exhibitions',
      where: { slug: { equals: sample.exhibitionSlug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const exhibition = exhibitions.docs[0]
    if (!exhibition) throw new Error(`Missing rehearsal exhibition: ${sample.exhibitionSlug}`)
    const currentIds = (exhibition.includedInstallations ?? []).map((item) =>
      typeof item === 'object' ? item.id : item,
    )
    if (!currentIds.includes(installation.id)) {
      await payload.update({
        collection: 'exhibitions',
        id: exhibition.id,
        draft: false,
        data: { includedInstallations: [...currentIds, installation.id], _status: 'published' },
      })
    }
  }

  const unpublished = await payload.find({
    collection: 'installations',
    where: { slug: { equals: 'dev-unpublished' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!unpublished.docs[0]) {
    await payload.create({
      collection: 'installations',
      draft: true,
      data: {
        title: 'Unpublished Development Sample',
        slug: 'dev-unpublished',
        generateSlug: false,
        year: 2026,
        shortDescription: 'Draft-only fixture for checking public access rules.',
        materials: 'Development placeholder',
        dimensions: 'Development placeholder',
        heroImage: 36,
        thumbnailImage: 29,
        sortOrder: 99,
        _status: 'draft',
      },
    })
  }

  const dance = await payload.findGlobal({ slug: 'dance', depth: 0 })
  await payload.updateGlobal({
    slug: 'dance',
    data: {
      showreel:
        dance.showreel?.video || dance.showreel?.vimeoUrl
          ? dance.showreel
          : { video: 62, videoPoster: 53 },
      performanceFootage: dance.performanceFootage?.length
        ? dance.performanceFootage
        : [
            {
              title: 'Development Showreel Excerpt',
              year: 2026,
              video: 62,
              videoPoster: 53,
              credits: [{ name: 'Development fixture', role: 'Placeholder playback only' }],
            },
          ],
    },
  })

  const cv = await payload.findGlobal({ slug: 'cv', depth: 0 })
  if (!cv.fullPdf) {
    await payload.updateGlobal({
      slug: 'cv',
      data: { fullPdf: 15, downloadFilename: 'Claire-Foody-CV-DEVELOPMENT.pdf' },
    })
  }

  console.log(
    'Seeded a local admin plus development-only installations, an unpublished access fixture, relationships, playback, and CV PDF.',
  )
} finally {
  await payload.destroy()
}
