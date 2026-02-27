import { timeAgo } from '@/lib/time'
import type { Blog } from '@/payload-types'
import Link from 'next/link'

export function BlogPostCard({ post }: { post: Blog }) {
  return (
    <div className="flex flex-col">
      <Link href={`/blog/${post.slug}`} className="text-blue-700 font-sans hover:underline">{post.title}</Link>
      <p className="text-sm leading-7">{post.excerpt}</p>
      {post.publishedAt && <small className="text-sm leading-none font-medium text-muted-foreground">Published {timeAgo(post.publishedAt)}</small>}
    </div>
  )
}
