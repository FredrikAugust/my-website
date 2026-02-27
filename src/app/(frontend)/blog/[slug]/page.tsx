export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Separator } from '@/components/ui/separator'
import { CodeBlock } from '@/components/HighlightJS'
import { timeAgo } from '@/lib/time'
import type { BlogImage } from '@/payload-types'
import type { JSX } from 'react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const post = result.docs[0]
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = result.docs[0]
  if (!post) notFound()

  const published = post.publishedAt ? timeAgo(post.publishedAt) : null
  const updated = timeAgo(post.updatedAt)
  const featuredImage = post.featuredImage as BlogImage | null

  return (
    <article className="flex flex-col gap-3 overflow-x-hidden [&_a]:!text-foreground [&_a]:underline [&_a]:!font-serif">
      <Link href="/blog" className="text-sm">
        &larr; Back to all blog posts
      </Link>

      <div className="flex flex-col">
        {featuredImage?.url && (
          <img
            className="max-h-[30svh] object-contain self-start mb-2 rounded"
            src={
              typeof featuredImage === 'object' && 'sizes' in featuredImage
                ? ((featuredImage.sizes as Record<string, { url?: string | null }>)?.large?.url ??
                  featuredImage.url)
                : featuredImage.url
            }
            alt={featuredImage.alt}
          />
        )}
        <h1 className="!text-4xl">{post.title}</h1>
        {published && <small className="mt-1">{`Published ${published}`}</small>}
        {published !== updated && <small>{`Updated ${updated}`}</small>}
        <Separator className="mt-2" />
      </div>

      {post.excerpt && (
        <div className="border-l-2 border-muted-foreground/30 py-1 px-3 w-fit flex flex-col">
          <span className="font-sans text-sm font-medium">Abstract</span>
          <p className="text-sm text-muted-foreground max-w-full">{post.excerpt}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <RichText data={post.content} />
      </div>
    </article>
  )
}
