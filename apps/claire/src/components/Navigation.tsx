'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { workCategories } from '@/lib/workCategories'

export function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const workButton = useRef<HTMLButtonElement>(null)
  const pointerFocus = useRef(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const workActive = [
    '/works',
    '/installations',
    '/exhibitions',
    '/dance',
    '/performance',
    '/film',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) {
        setWorkOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])

  function close() {
    setMenuOpen(false)
    setWorkOpen(false)
  }

  return (
    <header
      ref={header}
      className={`site-header ${menuOpen ? 'menu-is-open' : ''}`}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        if (workOpen) {
          workButton.current?.focus()
          setWorkOpen(false)
        } else if (menuOpen) {
          setMenuOpen(false)
          menuButton.current?.focus()
        }
      }}
    >
      <nav
        className={`site-shell navigation ${pathname === '/' ? 'navigation-home' : ''}`}
        aria-label="Main navigation"
      >
        {pathname !== '/' && (
          <Link href="/" onClick={close} className="wordmark">
            Claire Foody
          </Link>
        )}
        <button
          ref={menuButton}
          type="button"
          className="menu-toggle text-link"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => {
            setMenuOpen(!menuOpen)
            setWorkOpen(false)
          }}
        >
          {menuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            'Menu'
          )}
        </button>
        <div id="main-navigation" className={`navigation-links ${menuOpen ? 'is-open' : ''}`}>
          <div
            className="work-menu"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 768px)').matches)
                setWorkOpen(true)
            }}
            onPointerLeave={(event) => {
              if (
                event.pointerType === 'mouse' &&
                !event.currentTarget.contains(document.activeElement)
              )
                setWorkOpen(false)
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setWorkOpen(false)
            }}
          >
            <button
              ref={workButton}
              type="button"
              className={`text-link ${workActive ? 'is-active' : ''}`}
              aria-expanded={workOpen}
              aria-controls="work-navigation"
              onFocus={(event) => {
                if (!pointerFocus.current && event.currentTarget.matches(':focus-visible'))
                  setWorkOpen(true)
              }}
              onPointerDown={() => {
                pointerFocus.current = true
              }}
              onPointerUp={() => {
                pointerFocus.current = false
              }}
              onClick={(event) => {
                if (event.detail === 0 || window.matchMedia('(min-width: 768px)').matches)
                  setWorkOpen(true)
                else setWorkOpen(!workOpen)
              }}
            >
              Work
            </button>
            <div id="work-navigation" className="work-dropdown" hidden={!workOpen}>
              {workCategories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-link"
                  onClick={close}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/cv"
            onClick={close}
            className="text-link"
            aria-current={pathname === '/cv' ? 'page' : undefined}
          >
            CV
          </Link>
          <Link
            href="/about#contact"
            onClick={close}
            className="text-link"
            aria-current={pathname === '/about' ? 'page' : undefined}
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  )
}
