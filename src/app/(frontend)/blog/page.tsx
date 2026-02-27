export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { timeAgo } from '@/lib/time'

export const metadata: Metadata = {
  title: 'Blog',
}

export default async function BlogPage() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'blog',
    sort: '-publishedAt',
    where: { status: { equals: 'published' } },
  })

  return (
    <section>
      <h1>Blog posts</h1>
      <div className="flex flex-col gap-3 mt-3">
        {posts.docs.map((post) => (
          <div key={post.id} className="flex flex-col">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <p className="text-sm">{post.excerpt}</p>
            <small>{post.publishedAt ? timeAgo(post.publishedAt) : ''}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
