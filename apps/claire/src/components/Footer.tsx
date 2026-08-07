import Link from 'next/link'

interface SiteSettingsData {
  artistName: string
  footerBio?: string | null
  email?: string | null
  phone?: string | null
  vimeoUrl?: string | null
  instagramUrl?: string | null
}

const navLinks = [
  { href: '/works', label: 'Works' },
  { href: '/film', label: 'Film' },
  { href: '/performance', label: 'Performance' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
  { href: '/contact', label: 'Contact' },
]

export function Footer({ siteSettings }: { siteSettings: SiteSettingsData }) {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl mb-6">{siteSettings.artistName}</h3>
            {siteSettings.footerBio && (
              <p className="text-sm text-primary-foreground/85 leading-relaxed">
                {siteSettings.footerBio}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-primary-foreground">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary-foreground/85 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-primary-foreground">
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/85">
              {siteSettings.email && (
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="hover:text-primary-foreground transition-colors"
                >
                  {siteSettings.email}
                </a>
              )}
              {siteSettings.phone && <span>{siteSettings.phone}</span>}
              <div className="flex gap-4 mt-2">
                {siteSettings.vimeoUrl && (
                  <a
                    href={siteSettings.vimeoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Vimeo
                  </a>
                )}
                {siteSettings.instagramUrl && (
                  <a
                    href={siteSettings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-xs text-primary-foreground/40">
          &copy; 2026 {siteSettings.artistName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
