import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fredrik", template: "%s | Fredrik" },
  description: "Fredrik's homepage about software, development, and technology",
  keywords:
    "Fredrik August Madsen-Malmo, homepage, software, development, programming, k3s, golang, rust, typescript",
  authors: [{ name: "Fredrik August Madsen-Malmo" }],
  openGraph: {
    type: "website",
    siteName: "Fredrik's Homepage",
    title: "Fredrik",
    description: "Fredrik's homepage about software, development, and technology",
  },
  twitter: {
    card: "summary",
    title: "Fredrik",
    description: "Fredrik's homepage about software, development, and technology",
  },
  other: {
    "fediverse:creator": "@fredrikmalmo@mastodon.social",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

async function Footer() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("payload-token");

  return (
    <footer className="text-xs text-muted-foreground pb-6 pt-2 font-sans">
      <Separator className="mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <p className="leading-relaxed max-w-lg">
          Built with Next.js &amp; Payload CMS, hosted on k3s (Hetzner) behind Traefik. DNS and
          caching via Cloudflare. Observability on Dash0.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0">
          <ThemeToggle />
          <a
            className="hover:text-foreground transition-colors"
            href="https://www.abuseipdb.com/user/244214"
            title="AbuseIPDB Contributor"
          >
            <img
              src="https://www.abuseipdb.com/contributor/244214.svg"
              loading="lazy"
              className="h-6"
              alt="AbuseIPDB Contributor Badge"
            />
          </a>
          <a
            className="flex gap-1 items-center hover:text-foreground hover:underline transition-colors"
            href="https://github.com/fredrikaugust/my-website"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/github-mark.svg" className="h-3 dark:invert" alt="github logo" />
            Source
          </a>
          <a
            className="hover:text-foreground hover:underline transition-colors"
            rel="me"
            href="https://mastodon.social/@fredrikmalmo"
          >
            Mastodon
          </a>
          <a className="hover:text-foreground hover:underline transition-colors" href="/feed.xml">
            RSS
          </a>
          {isLoggedIn ? (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const dash0Env = process.env.DASH0_WEBSITE_MONITORING_ENVIRONMENT ?? "development";
  const dash0Token = process.env.DASH0_WEBSITE_MONITORING_INGEST_TOKEN ?? "INVALID_TOKEN";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="mx-auto container max-w-5xl min-h-dvh flex flex-col font-serif px-4 pt-4">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 py-4">{children}</main>
          <Footer />
        </ThemeProvider>
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
  );
}
