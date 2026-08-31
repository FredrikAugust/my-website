'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

export const navLinks = [
  { href: '/installations', label: 'Installations' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/film', label: 'Film' },
  { href: '/dance', label: 'Dance' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
]

const artistName = 'Claire Foody'

export function Navigation({ variant = 'dark' }: { variant?: 'light' | 'dark' | 'adaptive' }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const usesLightChrome = variant === 'light'

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    if (!open) {
      panel.setAttribute('inert', '')
      return
    }

    panel.removeAttribute('inert')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const main = document.getElementById('main-content')
    const footer = document.querySelector('footer')
    main?.setAttribute('inert', '')
    footer?.setAttribute('inert', '')
    const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
      triggerRef.current?.focus()
    }
  }, [open])

  const chromeColor = usesLightChrome ? 'text-white' : 'text-[#11110f]'
  const panelTone = usesLightChrome ? 'bg-[#ee3f1f] text-[#11110f]' : 'bg-[#11110f] text-[#f3f1ea]'

  return (
    <nav aria-label="Primary" className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={`relative z-10 flex items-center justify-between px-5 py-5 md:px-9 md:py-7 ${open ? (usesLightChrome ? 'text-[#11110f]' : 'text-[#f3f1ea]') : chromeColor}`}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="pointer-events-auto font-heading text-[1.35rem] leading-none tracking-[-0.025em] transition-opacity duration-200 hover:opacity-60"
        >
          {artistName}
        </Link>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-index"
          onClick={() => setOpen((current) => !current)}
          className="nav-trigger pointer-events-auto flex min-h-11 min-w-11 items-center justify-end gap-3 text-sm"
        >
          <span>{open ? 'Close' : 'Index'}</span>
          <span className={`nav-trigger-mark ${open ? 'is-open' : ''}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        ref={panelRef}
        id="site-index"
        className={`nav-curtain pointer-events-auto fixed inset-0 overflow-y-auto ${panelTone} ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="flex min-h-[100svh] flex-col px-5 pb-8 pt-28 md:px-9 md:pb-10 md:pt-32">
          <div className="grid flex-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="max-w-[70rem]">
              {navLinks.map((link, index) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className="nav-index-link group flex items-baseline justify-between border-b border-current/20 py-2 font-heading text-[clamp(2.8rem,8.5vh,7.6rem)] leading-[0.9] tracking-[-0.055em]"
                    style={{ '--nav-order': index } as CSSProperties}
                  >
                    <span className="nav-index-label">{link.label}</span>
                    <span
                      className="text-[0.7rem] font-normal tracking-normal opacity-0 transition-opacity duration-200 group-hover:opacity-55 group-focus-visible:opacity-55"
                      aria-hidden="true"
                    >
                      View
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="nav-index-meta grid gap-8 text-sm leading-relaxed md:grid-cols-2 lg:grid-cols-1">
              <p>
                Canadian multidisciplinary artist and dancer working across choreography,
                installation, and film.
              </p>
              <div className="flex gap-6">
                <a href="mailto:contact@clairefoody.com" className="text-link-underline">
                  Email
                </a>
                <a href="https://www.instagram.com/claire.foody" className="text-link-underline">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
