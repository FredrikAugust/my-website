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
  const about = await payload.findGlobal({ slug: 'about', depth: 1 })
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
                className="text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
              >
                View CV &rarr;
              </Link>
              <Link
                href="/contact"
                className="text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
              >
                Contact &rarr;
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
      </section>
    </>
  )
}
