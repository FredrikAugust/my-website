'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface MobileMenuProps {
  artistName: string
  links: { href: string; label: string }[]
  variant?: 'light' | 'dark'
}

const menuId = 'mobile-navigation'

export function MobileMenu({ artistName, links, variant = 'dark' }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-sm"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-foreground'}`} />
        <span className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-foreground'}`} />
        <span className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-foreground'}`} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-60 overscroll-contain bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
        >
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-heading text-xl tracking-tight"
            >
              {artistName}
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="relative min-h-11 min-w-11 rounded-sm"
              aria-label="Close menu"
            >
              <span className="absolute left-2.5 top-1/2 block h-px w-6 rotate-45 bg-foreground" />
              <span className="absolute left-2.5 top-1/2 block h-px w-6 -rotate-45 bg-foreground" />
            </button>
          </div>
          <div className="flex flex-col gap-5 px-6 py-10">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="rounded-sm py-1 font-heading text-3xl tracking-tight text-foreground"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
