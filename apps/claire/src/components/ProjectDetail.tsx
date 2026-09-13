import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { extractPlainText } from '@/lib/richtext'
import { Arrow } from './Arrow'
import { ProjectHero } from './ProjectHero'
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
  image?: Media | null
  backHref: string
  backLabel: string
  nextProject?: RelatedLink | null
  previousProject?: RelatedLink | null
  metadata: string
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
  children?: ReactNode
}

export function ProjectDetail({
  image,
  backHref,
  backLabel,
  nextProject,
  previousProject,
  metadata,
  title,
  description,
  summary,
  source,
  gallery,
  credits,
  facts,
  relatedLabel,
  related,
  children,
}: ProjectDetailProps) {
  const playback = <ProjectPlayback source={source} />
  const hasDescription = description && extractPlainText(description).trim().length > 0
  return (
    <article className="site-shell project-detail">
      <header className="project-header">
        <Link className="project-back text-link" href={backHref}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m9 10-5 5 5 5M4 15h10a6 6 0 0 0 6-6V4" />
          </svg>
          <span>Back to {backLabel}</span>
        </Link>
        <h1 className="page-title">{title}</h1>
        <p className="metadata">{metadata}</p>
      </header>
      <div className="project-reading">
        <div className="project-story">
          {image?.url ? <ProjectHero image={image} /> : null}
          {hasDescription || summary ? (
            <div className="prose-copy">
              {hasDescription && description ? <RichText data={description} /> : <p>{summary}</p>}
            </div>
          ) : null}
        </div>
        <aside className="project-facts">
          {facts
            ?.filter(({ value }) => value)
            .map(({ label, value }) => (
              <div key={label}>
                <h2>{label}</h2>
                <div className="project-fact-value">{value}</div>
              </div>
            ))}
          <Credits credits={credits} />
        </aside>
      </div>
      {source.video || source.vimeoUrl ? <div className="project-film">{playback}</div> : null}
      {gallery?.length ? <ImageGallery images={gallery} /> : null}
      {children}
      <div className="project-related">
        {related?.length ? (
          <section>
            <h2>{relatedLabel}</h2>
            <ul>
              {related.map((item) => (
                <li key={item.href}>
                  <Link className="text-link" href={item.href}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <nav className="project-bottom-nav" aria-label="Project navigation">
        <div className="project-neighbors">
          {previousProject && (
            <Link className="project-previous" href={previousProject.href}>
              <span className="project-next-label">Previous project</span>
              <span className="project-next-title">
                <Arrow direction="left" />
                <span className="title-highlight">{previousProject.title}</span>
              </span>
            </Link>
          )}
          {nextProject && (
            <Link className="project-next" href={nextProject.href}>
              <span className="project-next-label">Next project</span>
              <span className="project-next-title">
                <span className="title-highlight">{nextProject.title}</span>
                <Arrow />
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  )
}
