import { CVSection } from '@/components/CVSection'
import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'CV',
  alternates: {
    canonical: '/cv',
  },
}

export default async function CVPage() {
  const payload = await getPayloadClient()
  const [cv, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'cv', depth: 0 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])

  return (
    <>
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Curriculum Vitae
          </p>
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl tracking-tight">Claire Foody</h1>
              <p className="text-muted-foreground mt-2">Canadian artist based in Europe</p>
            </div>
            {siteSettings.email && (
              <a
                href={`mailto:${siteSettings.email}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {siteSettings.email}
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            {cv.sections?.map((section) => (
              <CVSection key={section.id} title={section.title} entries={section.entries ?? []} />
            ))}
          </div>

          <div>
            {cv.sidebarSections?.map((section) => (
              <CVSection
                key={section.id}
                title={section.title}
                entries={section.entries ?? []}
                compact
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
