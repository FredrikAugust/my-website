'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface HeroVideoProps {
  videoUrl?: string | null
  videoMimeType?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt?: string
  descriptor?: string | null
  featuredHref?: string
  featuredTitle?: string
  featuredYear?: number
}

export function HeroVideo({
  videoUrl,
  videoMimeType,
  fallbackImageUrl,
  fallbackImageAlt,
  descriptor,
  featuredHref,
  featuredTitle,
  featuredYear,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [motionAllowed, setMotionAllowed] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setMotionAllowed(!query.matches)
      if (query.matches) videoRef.current?.pause()
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !motionAllowed) return
    void video.play().catch(() => undefined)
  }, [motionAllowed])

  return (
    <section
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#f2efe7] px-6 pb-10 pt-28 text-[#161616] md:px-10 md:pb-14 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-10.5rem)] max-w-[96rem] items-end gap-10 lg:grid-cols-[minmax(17rem,0.65fr)_minmax(0,1.65fr)] lg:gap-12">
        <div className="relative z-10 flex h-full flex-col justify-end pb-2 lg:pb-8">
          <p className="mb-auto hidden text-[0.68rem] uppercase tracking-[0.22em] text-[#7e332b] lg:block">
            Living archive · Selected work
          </p>
          <h1 className="max-w-[9ch] font-heading text-[clamp(3.4rem,6vw,7.25rem)] leading-[0.92] tracking-[-0.045em]">
            {descriptor ?? 'Choreography, installation, and film.'}
          </h1>
          <div className="mt-12 border-t border-black/25 pt-4 text-xs uppercase tracking-[0.17em]">
            <p className="font-semibold">
              01 / {featuredTitle ?? 'Selected work'}
              {featuredYear ? `, ${featuredYear}` : ''}
            </p>
            {featuredHref ? (
              <Link
                href={featuredHref}
                className="text-link-underline mt-8 inline-flex items-center gap-8 py-2"
              >
                Enter project <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative aspect-[4/3] min-h-[52svh] overflow-hidden bg-[#d8d4cb] lg:min-h-0">
          {fallbackImageUrl ? (
            <Image
              src={fallbackImageUrl}
              alt={fallbackImageAlt ?? ''}
              fill
              sizes="(max-width: 1024px) 100vw, 68vw"
              className="object-cover grayscale"
              priority
            />
          ) : null}
          {videoUrl && motionAllowed ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              poster={fallbackImageUrl ?? undefined}
              className="absolute inset-0 h-full w-full object-cover grayscale"
              preload="metadata"
              aria-hidden="true"
            >
              <source src={videoUrl} type={videoMimeType ?? 'video/mp4'} />
            </video>
          ) : null}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[#7e332b]/50" />
          <p className="absolute bottom-4 right-3 origin-bottom-right -rotate-90 text-[0.6rem] uppercase tracking-[0.16em] text-white/85 [writing-mode:vertical-rl]">
            Moving image · loop
          </p>
        </div>
      </div>
      <a
        href="#selected-works"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.2em] text-black/55 lg:hidden"
      >
        Scroll ↓
      </a>
    </section>
  )
}
