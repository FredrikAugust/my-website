'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MobileMenu } from './MobileMenu'

export const navLinks = [
  { href: '/installations', label: 'Installations' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/film', label: 'Film' },
  { href: '/dance', label: 'Dance' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
]

const artistName = 'Claire Foody'

export function Navigation({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const pathname = usePathname()
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-white' : 'text-foreground'

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 top-0 z-50 border-b ${isLight ? 'border-white/15 bg-black/30' : 'border-border/70 bg-background/95'}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`rounded-sm px-2 py-1 font-heading text-xl font-medium ${textColor}`}
        >
          {artistName}
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`border-b py-1 text-xs uppercase tracking-[0.17em] transition-colors ${textColor} ${active ? 'border-current' : 'border-transparent hover:border-current/50'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        <MobileMenu artistName={artistName} links={navLinks} variant={variant} />
      </div>
    </nav>
  )
}
