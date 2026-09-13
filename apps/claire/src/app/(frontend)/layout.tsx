import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type React from 'react'
import './globals.css'

const cormorant = localFont({
  src: '../../fonts/CormorantGaramond-Regular.ttf',
  variable: '--font-cormorant',
  display: 'swap',
  weight: '400',
})
const manrope = localFont({
  src: [
    { path: '../../fonts/Manrope-Regular.woff2', weight: '400' },
    { path: '../../fonts/Manrope-Medium.woff2', weight: '500' },
  ],
  variable: '--font-manrope',
  display: 'swap',
})

const baseUrl = process.env.SERVER_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Claire Foody',
    template: '%s | Claire Foody',
  },
  description:
    'Claire Foody is a Canadian artist based in Europe working across installation, film, and performance.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Claire Foody',
    description:
      'Claire Foody is a Canadian artist based in Europe working across installation, film, and performance.',
    url: '/',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <main id="main-content">{children}</main>
        <Footer siteSettings={siteSettings} />
        <Analytics />
      </body>
    </html>
  )
}
