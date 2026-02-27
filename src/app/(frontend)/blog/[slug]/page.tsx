import { CodeBlock } from '@/components/HighlightJS'
import { FadeIn, FadeUp } from '@/components/Motion'
import { Separator } from '@/components/ui/separator'
import { timeAgo } from '@/lib/time'
import type { BlogImage } from '@/payload-types'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

const getPost = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined },
  }
}

const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    ...defaultConverters.blocks,
    codeblock: ({ node }: { node: { fields: { code: string; language?: string } } }) => {
      const { code, language } = node.fields as { code: string; language?: string }
      return <CodeBlock code={code} language={language} />
    },
  },
})

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  const published = post.publishedAt ? timeAgo(post.publishedAt) : null
  const updated = timeAgo(post.updatedAt)
  const featuredImage =
    typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? (post.featuredImage as BlogImage)
      : null
  const imageUrl = featuredImage?.sizes?.large?.url ?? featuredImage?.url

  return (
    <article className="flex flex-col gap-3 overflow-x-hidden [&_a]:text-foreground [&_a]:underline [&_a]:font-serif">
      <FadeIn>
        <Link
          href="/"
          className="text-sm text-muted-foreground font-sans hover:text-foreground hover:underline transition-colors"
        >
          &larr; Back to all blog posts
        </Link>
      </FadeIn>

      <FadeUp>
        <div className="flex flex-col">
          {imageUrl && featuredImage && (
            <Image
              className="max-h-[30svh] w-auto object-contain self-start mb-2 rounded"
              src={imageUrl}
              alt={featuredImage.alt}
              width={featuredImage.sizes?.large?.width ?? featuredImage.width ?? 800}
              height={featuredImage.sizes?.large?.height ?? featuredImage.height ?? 400}
              priority
            />
          )}
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{post.title}</h1>
          {published && (
            <small className="text-sm leading-none font-medium text-muted-foreground mt-1">{`Published ${published}`}</small>
          )}
          {published !== updated && (
            <small className="text-sm leading-none font-medium text-muted-foreground">{`Updated ${updated}`}</small>
          )}
          <Separator className="mt-2" />
        </div>
      </FadeUp>

      {post.excerpt && (
        <FadeUp delay={0.1}>
          <div className="border-l-2 border-muted-foreground/30 py-1 px-3 w-fit flex flex-col">
            <span className="font-sans text-sm font-medium">Abstract</span>
            <p className="text-muted-foreground text-sm leading-7">{post.excerpt}</p>
          </div>
        </FadeUp>
      )}

      <FadeIn delay={0.2}>
        <div className="flex flex-col gap-2">
          <RichText data={post.content} converters={richTextConverters} />
        </div>
      </FadeIn>
    </article>
  )
}
