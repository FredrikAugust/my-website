import type { CollectionBeforeValidateHook, CollectionSlug } from 'payload'

export const projectCollectionSlugs = ['installations', 'exhibitions', 'films'] as const
export type ProjectCollectionSlug = (typeof projectCollectionSlugs)[number]

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const validateProjectSlugUniqueness =
  (currentCollection: ProjectCollectionSlug): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    const candidate = data?.slug ?? originalDoc?.slug ?? (data?.title ? slugify(data.title) : null)
    if (!candidate) return data

    for (const collection of projectCollectionSlugs) {
      if (collection === currentCollection) continue
      const match = await req.payload.find({
        collection: collection as CollectionSlug,
        where: { slug: { equals: candidate } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (match.totalDocs > 0) {
        throw new Error(`The slug “${candidate}” is already used by ${collection}.`)
      }
    }

    return data
  }
