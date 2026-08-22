import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { getPayloadClient } from '@/lib/payload'
import { mapProjectToRow, projectSocialImage } from '@/lib/projects'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'films',
    where: { _status: { equals: 'published' } },
    sort: 'sortOrder',
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return {
    title: 'Film',
    description: 'Independent dance films by Claire Foody.',
    alternates: { canonical: '/film' },
    openGraph: {
      title: 'Film',
      url: '/film',
      images: result.docs[0] ? projectSocialImage(result.docs[0]) : undefined,
    },
  }
}

export default async function FilmPage() {
  const payload = await getPayloadClient()
  const [films, filmPage] = await Promise.all([
    payload.find({
      collection: 'films',
      where: { _status: { equals: 'published' } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
      overrideAccess: false,
    }),
    payload.findGlobal({ slug: 'film-page', depth: 0 }),
  ])
  return (
    <>
      <Navigation />
      <WorksGrid
        works={films.docs.map((project) => mapProjectToRow('film', project))}
        label="Film"
        subtitle={filmPage.heading || 'Independent dance films'}
        description={
          filmPage.description || 'Moving-image works where choreography is created for the camera.'
        }
      />
    </>
  )
}
