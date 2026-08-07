'use client'

import Link from 'next/link'
import { useState } from 'react'

interface MobileMenuProps {
  artistName: string
  links: { href: string; label: string }[]
  variant?: 'light' | 'dark'
}

export function MobileMenu({ artistName, links, variant = 'dark' }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1.5 p-2"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span
          className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-black'} transition-transform ${open ? 'translate-y-[3.5px] rotate-45' : ''}`}
        />
        <span
          className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-black'} transition-opacity ${open ? 'opacity-0' : ''}`}
        />
        <span
          className={`block h-px w-6 ${variant === 'light' ? 'bg-white' : 'bg-black'} transition-transform ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`}
        />
      </button>

      <div
        className={`fixed inset-0 top-0 z-40 bg-background mix-blend-normal transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-heading text-xl tracking-tight"
          >
            {artistName}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2"
            aria-label="Close menu"
          >
            <span className="block h-px w-6 bg-foreground translate-y-[0.5px] rotate-45" />
            <span className="block h-px w-6 bg-foreground -translate-y-[0.5px] -rotate-45" />
          </button>
        </div>
        <div className="flex flex-col gap-6 px-6 py-12">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-2xl font-heading tracking-tight text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
