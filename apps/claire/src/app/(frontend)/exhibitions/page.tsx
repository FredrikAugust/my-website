import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { getPayloadClient } from '@/lib/payload'
import { mapProjectToRow, projectSocialImage } from '@/lib/projects'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'exhibitions',
    where: { _status: { equals: 'published' } },
    sort: ['sortOrder', '-id'],
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return {
    title: 'Exhibitions',
    description: 'Exhibitions and larger projects by Claire Foody.',
    alternates: { canonical: '/exhibitions' },
    openGraph: {
      title: 'Exhibitions',
      url: '/exhibitions',
      images: result.docs[0] ? projectSocialImage(result.docs[0]) : undefined,
    },
  }
}

export default async function ExhibitionsPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'exhibitions',
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
        works={result.docs.map((project) => mapProjectToRow('exhibition', project))}
        label="Exhibition"
      />
    </>
  )
}
