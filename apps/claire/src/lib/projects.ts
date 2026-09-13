import type { WorkCardData } from '@/components/WorkCard'
import type { WorkRowData } from '@/components/WorkRow'
import type { Exhibition, Film, Installation, Media } from '@/payload-types'

import { extractPlainText } from './richtext'

export type Project = Installation | Exhibition | Film
export type ProjectKind = 'exhibition' | 'film' | 'installation'

export const projectHref = (kind: ProjectKind, slug: string) =>
  kind === 'film' ? `/film/${slug}` : `/${kind}s/${slug}`

const projectImage = (project: Project) => {
  const thumbnail = typeof project.thumbnailImage === 'object' ? project.thumbnailImage : null
  const hero = typeof project.heroImage === 'object' ? project.heroImage : null
  return (thumbnail || hero) as Media | null
}

const projectYear = (project: Project) =>
  'year' in project ? project.year : project.dateLabel || project.startDate?.slice(0, 4) || ''

const projectDescription = (project: Project) => {
  if ('shortDescription' in project) return project.shortDescription
  return extractPlainText('overview' in project ? project.overview : project.description)
}

export const mapProjectToCard = (kind: ProjectKind, project: Project): WorkCardData => {
  const image = projectImage(project)
  return {
    id: project.id,
    href: projectHref(kind, project.slug),
    slug: project.slug,
    title: project.title,
    year: Number(projectYear(project)) || 0,
    category: kind,
    venue: 'venue' in project ? project.venue : null,
    imageUrl: image?.url,
    imageAlt: image?.alt,
  }
}

export const mapProjectToRow = (kind: ProjectKind, project: Project): WorkRowData => {
  const card = mapProjectToCard(kind, project)
  const image = projectImage(project)
  return {
    ...card,
    imageWidth: image?.width,
    imageHeight: image?.height,
    description: projectDescription(project),
  }
}

export const projectSocialImage = (project: Project) => {
  const image = projectImage(project)
  return image?.url
    ? [
        {
          url: image.url,
          alt: image.alt,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
        },
      ]
    : undefined
}
