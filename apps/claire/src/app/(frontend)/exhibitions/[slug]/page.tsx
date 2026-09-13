import { Navigation } from '@/components/Navigation'
import { ProjectDetail } from '@/components/ProjectDetail'
import { getProjectNeighbors } from '@/lib/nextProject'
import { getPayloadClient } from '@/lib/payload'
import { projectSocialImage } from '@/lib/projects'
import type { Installation, Media } from '@/payload-types'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

export const revalidate = 60
type PageProps = { params: Promise<{ slug: string }> }

const getExhibition = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'exhibitions',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
})

const displayDates = (project: NonNullable<Awaited<ReturnType<typeof getExhibition>>>) => {
  if (project.dateLabel) return project.dateLabel
  if (!project.startDate) return null
  const format = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
  const start = format.format(new Date(project.startDate))
  const end = project.endDate ? format.format(new Date(project.endDate)) : null
  return end && end !== start ? `${start} – ${end}` : start
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getExhibition(slug)
  if (!project) return { title: 'Exhibition Not Found' }
  const description = `${project.title} at ${project.venue}, ${project.city}.`
  return {
    title: project.title,
    description,
    alternates: { canonical: `/exhibitions/${slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `/exhibitions/${slug}`,
      images: projectSocialImage(project),
    },
  }
}

export default async function ExhibitionPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getExhibition(slug)
  if (!project) notFound()
  const { nextProject, previousProject } = await getProjectNeighbors('exhibition', project.id)
  const installations = (project.includedInstallations ?? []).filter(
    (item): item is Installation => typeof item === 'object' && item._status === 'published',
  )
  return (
    <>
      <Navigation />
      <ProjectDetail
        image={project.heroImage as Media}
        backHref="/exhibitions"
        backLabel="Exhibition"
        nextProject={nextProject}
        previousProject={previousProject}
        metadata="Exhibition"
        title={project.title}
        description={project.overview}
        source={project}
        gallery={project.documentation}
        credits={project.credits}
        facts={[
          {
            label: 'Venue',
            value: (
              <>
                {project.venue}
                <br />
                <span className="text-muted-foreground">{project.city}</span>
              </>
            ),
          },
          { label: 'Dates', value: displayDates(project) },
        ]}
        relatedLabel="Works in the Exhibition"
        related={installations.map((installation) => ({
          href: `/installations/${installation.slug}`,
          title: installation.title,
        }))}
      />
    </>
  )
}
