import { FooterAuthLink } from "@/components/FooterAuthLink";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
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

function Footer() {
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
          <FooterAuthLink />
        </div>
      </div>
    </footer>
  );
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  );
}
