import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'About',
  alternates: {
    canonical: '/about',
  },
}

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const [about, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'about', depth: 1 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])
  const portrait = about.portrait as Media | null

  return (
    <>
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {portrait?.url && (
            <div className="relative aspect-3/4 bg-secondary">
              <Image
                src={portrait.url}
                alt={portrait.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex flex-col justify-center">
            {about.headline && (
              <h1 className="font-heading text-4xl md:text-5xl tracking-tight mb-8">
                {about.headline}
              </h1>
            )}
            {about.bio && (
              <div className="text-foreground/80 leading-relaxed space-y-4">
                <RichText data={about.bio} />
              </div>
            )}

            <div className="flex gap-8 mt-10">
              <Link
                href="/cv"
                className="text-xs uppercase tracking-[0.2em] transition-[letter-spacing,color] hover:tracking-[0.3em] hover:text-muted-foreground"
              >
                View CV &rarr;
              </Link>
            </div>
          </div>
        </div>

        {about.approach?.title && (
          <div className="mt-24 max-w-3xl">
            <h2 className="font-heading text-3xl tracking-tight mb-6">{about.approach.title}</h2>
            {about.approach.content && (
              <div className="text-foreground/80 leading-relaxed">
                <RichText data={about.approach.content} />
              </div>
            )}
          </div>
        )}

        <section
          id="contact"
          className="scroll-mt-24 mt-24 border-t border-border pt-12"
          aria-labelledby="contact-heading"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <h2
            id="contact-heading"
            className="text-balance font-heading text-3xl tracking-tight md:text-4xl"
          >
            Work With Claire
          </h2>
          <div className="mt-8 flex flex-col items-start gap-3 text-lg">
            {siteSettings.email ? (
              <a
                className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                href={`mailto:${siteSettings.email}`}
              >
                {siteSettings.email}
              </a>
            ) : null}
            {siteSettings.phone ? (
              <a
                className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                href={`tel:${siteSettings.phone.replace(/\s/g, '')}`}
              >
                {siteSettings.phone}
              </a>
            ) : null}
            <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
              {siteSettings.vimeoUrl ? (
                <a
                  className="hover:text-foreground"
                  href={siteSettings.vimeoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Vimeo
                </a>
              ) : null}
              {siteSettings.instagramUrl ? (
                <a
                  className="hover:text-foreground"
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
