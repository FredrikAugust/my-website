import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60
export const metadata: Metadata = { title: 'About', alternates: { canonical: '/about' } }

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const [about, settings] = await Promise.all([
    payload.findGlobal({ slug: 'about', depth: 1 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])
  const portrait = about.portrait as Media | null
  return (
    <>
      <Navigation />
      <div className="site-shell page-section">
        <section className="about-grid">
          <h1 className="page-title">About</h1>
          {portrait?.url && (
            <Image
              src={portrait.url}
              alt={portrait.alt || 'Portrait of Claire Foody'}
              width={portrait.width || 900}
              height={portrait.height || 1200}
              priority
              sizes="(max-width: 767px) calc(100vw - 40px), 50vw"
              className="about-portrait"
            />
          )}
          <div>
            {about.bio && (
              <div className="prose-copy">
                <RichText data={about.bio} />
              </div>
            )}
            <div className="about-links">
              <Link href="/cv" className="text-link">
                View CV
              </Link>
            </div>
          </div>
        </section>
        {about.approach?.title && (
          <section className="practice-section">
            <h2 className="section-title">{about.approach.title}</h2>
            {about.approach.content && (
              <div className="prose-copy">
                <RichText data={about.approach.content} />
              </div>
            )}
          </section>
        )}
        <section id="contact" className="contact-section">
          <h2 className="section-title">Work with Claire</h2>
          {settings.email && (
            <a className="contact-email text-link" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          )}
          <div className="contact-links">
            {settings.instagramUrl && (
              <a
                className="text-link"
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {settings.vimeoUrl && (
              <a
                className="text-link"
                href={settings.vimeoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Vimeo
              </a>
            )}
            {settings.phone && (
              <div className="contact-phone">
                <span>Phone</span>
                <a className="text-link" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                  {settings.phone}
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
