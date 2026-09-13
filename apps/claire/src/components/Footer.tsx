interface SiteSettingsData {
  artistName: string
  email?: string | null
  instagramUrl?: string | null
}

export function Footer({ siteSettings }: { siteSettings: SiteSettingsData }) {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <span>
          © {new Date().getFullYear()} {siteSettings.artistName}
        </span>
        <div>
          {siteSettings.email && (
            <a className="text-link" href={`mailto:${siteSettings.email}`}>
              {siteSettings.email}
            </a>
          )}
        </div>
        <div>
          {siteSettings.instagramUrl && (
            <a
              className="text-link"
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
