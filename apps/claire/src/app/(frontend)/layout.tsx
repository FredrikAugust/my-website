import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Bodoni_Moda, Karla } from 'next/font/google'
import type React from 'react'
import './globals.css'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
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
    'Claire Foody is a Canadian artist based in Europe working across installation, film, and dance.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Claire Foody',
    description:
      'Claire Foody is a Canadian artist based in Europe working across installation, film, and dance.',
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
    <html lang="en" className={`${bodoniModa.variable} ${karla.variable}`}>
      <body className="bg-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1} className="scroll-mt-24 bg-background">
          {children}
        </main>
        <Footer siteSettings={siteSettings} />
        <Analytics />
      </body>
    </html>
  )
}
