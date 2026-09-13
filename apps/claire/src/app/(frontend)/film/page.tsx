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
    sort: ['sortOrder', '-id'],
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
  const films = await payload.find({
    collection: 'films',
    where: { _status: { equals: 'published' } },
    sort: ['sortOrder', '-id'],
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })
  return (
    <>
      <Navigation />
      <WorksGrid
        subtitle="Moving-image works where choreography is created for the camera."
        works={films.docs.map((project) => mapProjectToRow('film', project))}
        label="Film"
      />
    </>
  )
}
