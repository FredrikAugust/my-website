import { getPayloadClient } from '@/lib/payload'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SERVER_URL ?? 'http://localhost:3000'

  const payload = await getPayloadClient()
  const works = await payload.find({
    collection: 'works',
    limit: 1000,
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/works`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/film`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    {
      url: `${baseUrl}/performance`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${baseUrl}/cv`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const workRoutes: MetadataRoute.Sitemap = works.docs.map((work) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: new Date(work.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...workRoutes]
}
