import config from "@payload-config";
import type { MetadataRoute } from "next";
import { getPayload } from "payload";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SERVER_URL ?? "http://localhost:3000";
  const payload = await getPayload({ config });

  const posts = await payload.find({
    collection: "blog",
    draft: false,
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 1000,
    pagination: false,
    select: { slug: true, updatedAt: true },
  });

  const blogEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...blogEntries,
  ];
}
