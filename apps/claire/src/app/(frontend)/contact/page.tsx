import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Contact',
  alternates: {
    canonical: '/contact',
  },
}

export default async function ContactPage() {
  const payload = await getPayloadClient()

  const [contact, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'contact', depth: 0 }),
    payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    }),
  ])

  return (
    <>
      <Navigation />
      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6">
          Get in Touch
        </h1>
        {contact.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mb-16">{contact.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="space-y-3">
              {siteSettings.email && (
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="block text-lg hover:text-muted-foreground transition-colors"
                >
                  {siteSettings.email}
                </a>
              )}
              {siteSettings.phone && (
                <p className="text-lg text-foreground/80">{siteSettings.phone}</p>
              )}
            </div>
            <div className="flex gap-6 pt-4">
              {siteSettings.vimeoUrl && (
                <a
                  href={siteSettings.vimeoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vimeo
                </a>
              )}
              {siteSettings.instagramUrl && (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          {contact.inquiryCategories && contact.inquiryCategories.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Inquiries
              </h2>
              {contact.inquiryCategories.map((cat) => (
                <div key={cat.id} className="border-l-2 border-border pl-6">
                  <h3 className="font-heading text-lg tracking-tight">{cat.title}</h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
