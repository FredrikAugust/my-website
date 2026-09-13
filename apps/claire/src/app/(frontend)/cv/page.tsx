import { CVSection } from '@/components/CVSection'
import { Navigation } from '@/components/Navigation'
import { PrintCV } from '@/components/PrintCV'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'
import type { Metadata } from 'next'

export const revalidate = 60
export const metadata: Metadata = { title: 'CV', alternates: { canonical: '/cv' } }

export default async function CVPage() {
  const payload = await getPayloadClient()
  const cv = await payload.findGlobal({ slug: 'cv', depth: 1 })
  const fullPdf = typeof cv.fullPdf === 'object' ? (cv.fullPdf as Media) : null
  return (
    <>
      <Navigation />
      <section className="site-shell page-section">
        <div className="cv-heading">
          <div>
            <h1 className="page-title">CV</h1>
            <p>
              <span className="cv-name">Claire Foody</span>
              Canadian artist based in Europe
            </p>
          </div>
          {fullPdf?.url ? (
            <a href="/cv/download" className="text-link print-button">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
              </svg>
              Download PDF
            </a>
          ) : (
            <PrintCV />
          )}
        </div>
        <div className="cv-sections">
          {cv.sections?.map((section) => (
            <CVSection key={section.id} title={section.title} entries={section.entries ?? []} />
          ))}
          {cv.sidebarSections?.map((section) => (
            <CVSection
              key={section.id}
              title={section.title}
              entries={section.entries ?? []}
              compact
            />
          ))}
        </div>
      </section>
    </>
  )
}
