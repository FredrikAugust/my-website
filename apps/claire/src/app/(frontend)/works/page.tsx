import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { mapWorkToRow } from '@/lib/mapWorkToRow'
import { getPayloadClient } from '@/lib/payload'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Works',
  alternates: {
    canonical: '/works',
  },
}

export default async function WorksPage() {
  const payload = await getPayloadClient()

  const [works, worksPage] = await Promise.all([
    payload.find({
      collection: 'works',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
      select: {
        title: true,
        slug: true,
        year: true,
        category: true,
        medium: true,
        venue: true,
        description: true,
        thumbnailImage: true,
        heroImage: true,
      },
    }),
    payload.findGlobal({ slug: 'works-page', depth: 0 }),
  ])

  return (
    <>
      <Navigation />
      <WorksGrid
        works={works.docs.map(mapWorkToRow)}
        label="Works"
        subtitle={worksPage.heading}
        description={worksPage.description}
      />
    </>
  )
}
