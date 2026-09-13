import { Navigation } from '@/components/Navigation'
import { ProjectDetail } from '@/components/ProjectDetail'
import { getProjectNeighbors } from '@/lib/nextProject'
import { getPayloadClient } from '@/lib/payload'
import { projectSocialImage } from '@/lib/projects'
import type { Media } from '@/payload-types'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

export const revalidate = 60
type PageProps = { params: Promise<{ slug: string }> }

const getInstallation = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'installations',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getInstallation(slug)
  if (!project) return { title: 'Installation Not Found' }
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/installations/${slug}` },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      url: `/installations/${slug}`,
      images: projectSocialImage(project),
    },
  }
}

export default async function InstallationPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getInstallation(slug)
  if (!project) notFound()
  const { nextProject, previousProject } = await getProjectNeighbors('installation', project.id)

  const payload = await getPayloadClient()
  const exhibitions = await payload.find({
    collection: 'exhibitions',
    where: {
      and: [
        { includedInstallations: { contains: project.id } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'startDate',
    limit: 100,
    depth: 0,
    overrideAccess: false,
  })

  return (
    <>
      <Navigation />
      <ProjectDetail
        image={project.heroImage as Media}
        backHref="/installations"
        backLabel="Installation"
        nextProject={nextProject}
        previousProject={previousProject}
        metadata="Installation"
        title={project.title}
        summary={project.shortDescription}
        description={project.description}
        source={project}
        gallery={project.gallery}
        credits={project.credits}
        facts={[
          { label: 'Year', value: project.year },
          { label: 'Materials', value: project.materials },
          { label: 'Dimensions', value: project.dimensions },
        ]}
        relatedLabel="Presented In"
        related={exhibitions.docs.map((exhibition) => ({
          href: `/exhibitions/${exhibition.slug}`,
          title: exhibition.title,
        }))}
      />
    </>
  )
}
