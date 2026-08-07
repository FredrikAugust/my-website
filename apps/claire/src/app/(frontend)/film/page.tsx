import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { mapWorkToRow } from '@/lib/mapWorkToRow'
import { getPayloadClient } from '@/lib/payload'
import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Film',
  alternates: {
    canonical: '/film',
  },
}

export default async function FilmPage() {
  const payload = await getPayloadClient()

  const [works, filmPage] = await Promise.all([
    payload.find({
      collection: 'works',
      where: { category: { equals: 'film' } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
      select: {
        title: true,
        slug: true,
        year: true,
        category: true,
        medium: true,
        venue: true,
        description: true,
        thumbnailImage: true,
        heroImage: true,
      },
    }),
    payload.findGlobal({ slug: 'film-page', depth: 0 }),
  ])

  return (
    <>
      <Navigation />
      <WorksGrid
        works={works.docs.map(mapWorkToRow)}
        label="Film"
        subtitle={filmPage.heading}
        description={filmPage.description}
      />

      {filmPage.ctaTitle && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="border-t border-border pt-16 max-w-2xl">
            <h2 className="font-heading text-3xl tracking-tight mb-4">{filmPage.ctaTitle}</h2>
            {filmPage.ctaDescription && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {filmPage.ctaDescription}
              </p>
            )}
            <Link
              href="/contact"
              className="text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
            >
              Get in Touch &rarr;
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
