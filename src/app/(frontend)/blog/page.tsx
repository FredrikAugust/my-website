import { BlogPostCard } from '@/components/BlogPostCard'
import config from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Blog',
}

export default async function BlogPage() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'blog',
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <section>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">Blog posts</h1>
      <div className="flex flex-col gap-3 mt-3">
        {posts.docs.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
