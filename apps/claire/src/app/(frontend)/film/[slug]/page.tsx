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

const getFilm = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'films',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getFilm(slug)
  if (!project) return { title: 'Film Not Found' }
  const description = `${project.title}, a ${project.year} dance film by Claire Foody.`
  return {
    title: project.title,
    description,
    alternates: { canonical: `/film/${slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `/film/${slug}`,
      images: projectSocialImage(project),
    },
  }
}

export default async function FilmDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getFilm(slug)
  if (!project) notFound()
  const { nextProject, previousProject } = await getProjectNeighbors('film', project.id)
  return (
    <>
      <Navigation />
      <ProjectDetail
        image={project.heroImage as Media}
        backHref="/film"
        backLabel="Film"
        nextProject={nextProject}
        previousProject={previousProject}
        metadata="Film"
        title={project.title}
        description={project.description}
        source={project}
        gallery={project.stills}
        credits={project.credits}
        facts={[
          { label: 'Year', value: project.year },
          { label: 'Duration', value: project.duration },
          {
            label: 'Screenings',
            value: project.screenings?.length ? (
              <ul className="space-y-2">
                {project.screenings.map((screening) => (
                  <li key={screening.id ?? `${screening.festival}-${screening.year}`}>
                    {screening.festival}
                    <br />
                    <span className="text-muted-foreground">
                      {screening.location}, {screening.year}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null,
          },
        ]}
      />
    </>
  )
}
