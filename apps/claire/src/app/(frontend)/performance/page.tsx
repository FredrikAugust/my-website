import { Navigation } from '@/components/Navigation'
import { WorksGrid } from '@/components/WorksGrid'
import { mapWorkToRow } from '@/lib/mapWorkToRow'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Performance',
  alternates: {
    canonical: '/performance',
  },
}

export default async function PerformancePage() {
  const payload = await getPayloadClient()

  const [works, perfPage] = await Promise.all([
    payload.find({
      collection: 'works',
      where: { category: { equals: 'performance' } },
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
    payload.findGlobal({ slug: 'performance-page', depth: 0 }),
  ])

  return (
    <>
      <Navigation />
      <WorksGrid
        works={works.docs.map(mapWorkToRow)}
        label="Performance"
        subtitle={perfPage.heading}
        description={perfPage.description}
      />

      {perfPage.backgroundTitle && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="border-t border-border pt-16">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Background
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <h2 className="font-heading text-3xl tracking-tight mb-6">
                  {perfPage.backgroundTitle}
                </h2>
                {perfPage.backgroundContent && (
                  <div className="text-foreground/80 leading-relaxed">
                    <RichText data={perfPage.backgroundContent} />
                  </div>
                )}
              </div>

              {perfPage.affiliations && perfPage.affiliations.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                    Professional Affiliations
                  </h3>
                  <div className="space-y-4">
                    {perfPage.affiliations.map((aff) => (
                      <div key={aff.id} className="border-l-2 border-border pl-4">
                        <p className="text-sm font-medium">{aff.organization}</p>
                        {aff.role && <p className="text-sm text-muted-foreground">{aff.role}</p>}
                        {aff.years && <p className="text-xs text-muted-foreground">{aff.years}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {perfPage.ctaTitle && (
        <section className="bg-secondary py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="font-heading text-3xl md:text-4xl tracking-tight mb-4">
              {perfPage.ctaTitle}
            </h2>
            {perfPage.ctaDescription && (
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                {perfPage.ctaDescription}
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
