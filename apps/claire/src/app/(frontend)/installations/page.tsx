import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { getPayloadClient } from '@/lib/payload'
import { mapProjectToRow, projectSocialImage } from '@/lib/projects'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'installations',
    where: { _status: { equals: 'published' } },
    sort: 'sortOrder',
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return {
    title: 'Installations',
    description: 'Physical artworks by Claire Foody incorporating film and movement into objects.',
    alternates: { canonical: '/installations' },
    openGraph: {
      title: 'Installations',
      url: '/installations',
      images: result.docs[0] ? projectSocialImage(result.docs[0]) : undefined,
    },
  }
}

export default async function InstallationsPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'installations',
    where: { _status: { equals: 'published' } },
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })

  return (
    <>
      <Navigation />
      <WorksGrid
        works={result.docs.map((project) => mapProjectToRow('installation', project))}
        label="Installations"
        subtitle="Objects shaped by film and movement"
        description="Individual physical artworks, presented through moving image, material, and space."
      />
    </>
  )
}
