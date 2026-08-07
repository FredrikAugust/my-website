import type { Media, Work } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ImageGallery } from './ImageGallery'
import { VimeoEmbed } from './VimeoEmbed'
import { WorkVideo } from './WorkVideo'
import { selectWorkPlayback } from '@/lib/workPlayback'

export function ProjectInfo({ work }: { work: Work }) {
  const playback = selectWorkPlayback(work)

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {work.year}
          </span>
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {work.category}
          </span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight">
          {work.title}
        </h1>
        {work.subtitle && <p className="mt-2 text-lg text-muted-foreground">{work.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <div className="lg:col-span-2 space-y-12">
          {work.description && (
            <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
              <RichText data={work.description} />
            </div>
          )}

          {playback?.type === 'upload' && (
            <WorkVideo video={playback.video} poster={playback.poster} />
          )}
          {playback?.type === 'vimeo' && <VimeoEmbed url={playback.url} />}

          {work.gallery && work.gallery.length > 0 && <ImageGallery images={work.gallery} />}
        </div>

        <div className="space-y-6">
          {work.medium && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Medium
              </h4>
              <p className="text-sm">{work.medium}</p>
            </div>
          )}
          {work.duration && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Duration
              </h4>
              <p className="text-sm">{work.duration}</p>
            </div>
          )}
          {work.venue && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                Venue
              </h4>
              <p className="text-sm">{work.venue}</p>
              {work.venueLocation && (
                <p className="text-sm text-muted-foreground">{work.venueLocation}</p>
              )}
            </div>
          )}

          {work.collaborators && work.collaborators.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Collaborators
              </h4>
              <ul className="space-y-1">
                {work.collaborators.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground"> — {c.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {work.performers && work.performers.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Performers
              </h4>
              <ul className="space-y-1">
                {work.performers.map((p) => (
                  <li key={p.id} className="text-sm">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {work.screenings && work.screenings.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Screenings
              </h4>
              <ul className="space-y-1">
                {work.screenings.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span>{s.festival}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      — {s.location}, {s.year}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {work.files && work.files.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Resources
              </h4>
              <ul className="space-y-1">
                {work.files.map((f) => {
                  const file = f.file as Media
                  return (
                    <li key={f.id}>
                      <a
                        href={file.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
                      >
                        {f.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
