import { getPayloadClient } from '@/lib/payload'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SERVER_URL ?? 'http://localhost:3000'
  const payload = await getPayloadClient()
  const [installations, exhibitions, films] = await Promise.all([
    payload.find({
      collection: 'installations',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      pagination: false,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'exhibitions',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      pagination: false,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'films',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      pagination: false,
      overrideAccess: false,
    }),
  ])
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${baseUrl}/installations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${baseUrl}/exhibitions`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/film`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dance`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/cv`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
  const details = [
    ...installations.docs.map((item) => ({ section: 'installations', item })),
    ...exhibitions.docs.map((item) => ({ section: 'exhibitions', item })),
    ...films.docs.map((item) => ({ section: 'film', item })),
  ].map(({ section, item }) => ({
    url: `${baseUrl}/${section}/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  return [...staticRoutes, ...details]
}
