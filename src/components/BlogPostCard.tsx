import { timeAgo } from '@/lib/time'
import type { Blog } from '@/payload-types'
import Link from 'next/link'

export function BlogPostCard({ post }: { post: Blog }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col border border-border rounded-lg p-4 hover:bg-accent transition-colors"
    >
      <span className="font-sans font-medium group-hover:underline">{post.title}</span>
      {post.excerpt && (
        <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{post.excerpt}</p>
      )}
      {post.publishedAt && (
        <small className="text-xs mt-2 block leading-none font-medium text-muted-foreground">
          Published {timeAgo(post.publishedAt)}
        </small>
      )}
    </Link>
  )
}
