import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Credits } from './Credits'
import { ImageGallery } from './ImageGallery'
import { ProjectPlayback } from './ProjectPlayback'

interface GalleryItem {
  image: number | Media
  caption?: string | null
  id?: string | null
}

interface RelatedLink {
  href: string
  title: string
}

interface ProjectDetailProps {
  eyebrow: string
  title: string
  description?: Parameters<typeof RichText>[0]['data'] | null
  summary?: string | null
  source: {
    video?: number | Media | null
    videoPoster?: number | Media | null
    vimeoUrl?: string | null
  }
  gallery?: GalleryItem[] | null
  credits?: { id?: string | null; name: string; role: string }[] | null
  facts?: { label: string; value?: ReactNode }[]
  relatedLabel?: string
  related?: RelatedLink[]
  playbackFirst?: boolean
  children?: ReactNode
}

export function ProjectDetail({
  eyebrow,
  title,
  description,
  summary,
  source,
  gallery,
  credits,
  facts,
  relatedLabel,
  related,
  playbackFirst = false,
  children,
}: ProjectDetailProps) {
  const playback = <ProjectPlayback source={source} />
  return (
    <article className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <header className="mb-14 max-w-4xl">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="text-balance font-heading text-4xl tracking-tight md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {summary ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/75">{summary}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] lg:gap-20">
        <div className="min-w-0 space-y-12">
          {playbackFirst ? playback : null}
          {description ? (
            <div className="prose prose-lg max-w-3xl text-pretty text-foreground/80">
              <RichText data={description} />
            </div>
          ) : null}
          {!playbackFirst ? playback : null}
          {gallery?.length ? <ImageGallery images={gallery} /> : null}
          {children}
        </div>

        <aside className="space-y-8">
          {facts
            ?.filter(({ value }) => value)
            .map(({ label, value }) => (
              <div key={label}>
                <h2 className="mb-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {label}
                </h2>
                <div className="text-sm leading-relaxed">{value}</div>
              </div>
            ))}
          <Credits credits={credits} />
          {related?.length ? (
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {relatedLabel}
              </h2>
              <ul className="space-y-2">
                {related.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                      href={item.href}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  )
}
