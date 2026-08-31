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
}

export function HeroVideo({
  videoUrl,
  videoMimeType,
  fallbackImageUrl,
  fallbackImageAlt,
  descriptor,
  featuredHref,
  featuredTitle,
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
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#080808] px-6 pb-12 pt-28 text-[#f0ede6] md:px-10 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-11rem)] max-w-[96rem] items-center gap-8 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.45fr)_4rem] lg:gap-12">
        <div className="relative z-10 self-end pb-5 lg:self-center lg:pb-0">
          <p className="mb-8 font-heading text-xl text-[#f0ede6]/55">A practice in motion</p>
          <h1 className="max-w-[9ch] font-heading text-[clamp(3.5rem,6.2vw,7.4rem)] leading-[0.9] tracking-[-0.045em]">
            {descriptor ?? 'Choreography, installation, and film.'}
          </h1>
          <div className="mt-12 text-xs uppercase tracking-[0.2em]">
            <p className="text-[#f0ede6]/60">Now showing — {featuredTitle ?? 'Selected work'}</p>
            {featuredHref ? (
              <Link
                href={featuredHref}
                className="mt-7 inline-flex items-center gap-8 text-[#ef6b2e]"
              >
                Enter <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative self-center py-8 lg:py-0">
          <div className="absolute -inset-y-8 -right-8 w-px bg-[#f0ede6]/20" aria-hidden="true" />
          <div className="relative aspect-[16/9] -rotate-[1.25deg] overflow-hidden bg-[#1b1b1b] shadow-[0_2rem_6rem_rgb(0_0_0/0.8)]">
            {fallbackImageUrl ? (
              <Image
                src={fallbackImageUrl}
                alt={fallbackImageAlt ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover grayscale contrast-110"
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
                className="absolute inset-0 h-full w-full object-cover grayscale contrast-110"
                preload="metadata"
                aria-hidden="true"
              >
                <source src={videoUrl} type={videoMimeType ?? 'video/mp4'} />
              </video>
            ) : null}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
        </div>

        <div className="hidden h-52 flex-col items-center justify-between self-center text-xs tracking-[0.18em] text-[#f0ede6]/65 lg:flex">
          <span>01</span>
          <span className="h-28 w-px bg-[#f0ede6]/40" aria-hidden="true" />
          <span>03</span>
        </div>
      </div>
      <a
        href="#selected-works"
        className="absolute bottom-4 right-6 text-[0.62rem] uppercase tracking-[0.2em] text-[#f0ede6]/55"
      >
        Next scene ↓
      </a>
    </section>
  )
}
