import Link from 'next/link'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { href: '/works', label: 'Works' },
  { href: '/film', label: 'Film' },
  { href: '/performance', label: 'Performance' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
  { href: '/contact', label: 'Contact' },
]

const artistName = 'Claire Foody'

export function Navigation({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-black'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link href="/" className={`font-heading font-medium text-xl px-2 py-1 ${textColor}`}>
          {artistName}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-[0.2em] ${textColor}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <MobileMenu artistName={artistName} links={navLinks} variant={variant} />
      </div>
    </nav>
  )
}
