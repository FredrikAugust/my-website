export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Separator } from '@/components/ui/separator'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Fredrik', template: '%s | Fredrik' },
  description: "Fredrik's homepage about software, development, and technology",
  keywords:
    'Fredrik August Madsen-Malmo, homepage, software, development, programming, k3s, golang, rust, typescript',
  authors: [{ name: 'Fredrik August Madsen-Malmo' }],
  openGraph: {
    type: 'website',
    siteName: "Fredrik's Homepage",
    title: 'Fredrik',
    description: "Fredrik's homepage about software, development, and technology",
  },
  twitter: {
    card: 'summary',
    title: 'Fredrik',
    description: "Fredrik's homepage about software, development, and technology",
  },
  other: {
    'fediverse:creator': '@fredrikmalmo@mastodon.social',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

async function Navbar() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <nav className="flex items-center gap-3 py-2 text-sm font-sans">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/blog" className="hover:underline">
        Blog
      </Link>
      {user ? (
        <span className="ml-auto text-muted-foreground">Signed in</span>
      ) : (
        <Link href="/login" className="ml-auto hover:underline">
          Login
        </Link>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="text-xs text-muted-foreground flex flex-col gap-2 pb-4">
      <Separator />
      <p>
        This website is built with Next.js and Payload CMS, styled with Tailwind CSS and shadcn/ui.
        It&apos;s hosted in a Kubernetes (k3s) cluster on Hetzner cloud, using Traefik as a reverse
        proxy. DNS, static asset caching and basic protection is handled on Cloudflare. Observability
        is done on Dash0.
      </p>
      <a
        href="https://www.abuseipdb.com/user/244214"
        title="AbuseIPDB is an IP address blacklist for webmasters and sysadmins to report IP addresses engaging in abusive behavior on their networks"
      >
        {/* biome-ignore lint: external image */}
        <img
          src="https://www.abuseipdb.com/contributor/244214.svg"
          loading="lazy"
          className="h-8"
          alt="AbuseIPDB Contributor Badge"
        />
      </a>
      <a
        className="flex gap-1 items-center font-sans"
        href="https://github.com/fredrikaugust/my-website"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/images/github-mark.svg" className="h-3" alt="github logo" />
        Source code
      </a>
      <div className="flex gap-1">
        <a rel="me" href="https://mastodon.social/@fredrikmalmo">
          Mastodon
        </a>
        <span>&bull;</span>
        <a href="/feed.xml">RSS Feed (Atom)</a>
      </div>
    </footer>
  )
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const dash0Env = process.env.DASH0_WEBSITE_MONITORING_ENVIRONMENT ?? 'development'
  const dash0Token = process.env.DASH0_WEBSITE_MONITORING_INGEST_TOKEN ?? 'INVALID_TOKEN'

  return (
    <html lang="en">
      <body className="mx-auto container max-w-3xl min-h-dvh flex flex-col font-serif px-4">
        <Navbar />
        <main className="flex-1 py-4">{children}</main>
        <Footer />
        <Script id="dash0-init" strategy="afterInteractive">
          {`window.dash0=window.dash0||function(){(window.dash0._q=window.dash0._q||[]).push(arguments)};dash0('init',{serviceName:'fredrik-homepage',environment:'${dash0Env}',endpoint:{url:'https://ingress.europe-west4.gcp.dash0.com',authToken:'${dash0Token}'}});`}
        </Script>
        <Script
          src="https://unpkg.com/@dash0/sdk-web@0.18.0/dist/dash0.iife.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
