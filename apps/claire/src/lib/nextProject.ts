import { getPayloadClient } from './payload'
import { projectHref, type ProjectKind } from './projects'

export async function getProjectNeighbors(kind: ProjectKind, id: number) {
  const payload = await getPayloadClient()
  const collection =
    kind === 'film' ? 'films' : kind === 'exhibition' ? 'exhibitions' : 'installations'
  const projects = await payload.find({
    collection,
    where: { _status: { equals: 'published' } },
    sort: ['sortOrder', '-id'],
    pagination: false,
    depth: 0,
    overrideAccess: false,
    select: { title: true, slug: true },
  })
  const index = projects.docs.findIndex((project) => project.id === id)
  if (index < 0 || projects.docs.length < 2) return { nextProject: null, previousProject: null }
  const next = projects.docs[(index + 1) % projects.docs.length]
  const previous = projects.docs[(index - 1 + projects.docs.length) % projects.docs.length]
  return {
    nextProject: { title: next.title, href: projectHref(kind, next.slug) },
    previousProject: { title: previous.title, href: projectHref(kind, previous.slug) },
  }
}
