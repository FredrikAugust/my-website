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
      className="score-grid relative min-h-[100svh] overflow-hidden bg-[#f4f3ee] px-6 pb-12 pt-28 text-[#111] md:px-10 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-11rem)] max-w-[96rem] grid-cols-12 grid-rows-[auto_auto_auto_auto] gap-x-4 md:grid-rows-[auto_auto_1fr] md:gap-x-6">
        <div className="col-span-12 flex items-center justify-between border-y border-black/25 py-3 text-[0.65rem] uppercase tracking-[0.19em] text-[#1648ff]">
          <span>Score 2.1 / Homepage</span>
          <span>Tempo 72</span>
          <span className="hidden sm:inline">Duration ∞</span>
        </div>

        <h1 className="col-span-12 mt-8 max-w-[12ch] font-heading text-[clamp(3.5rem,8vw,8.7rem)] uppercase leading-[0.82] tracking-[0.09em] md:col-span-7 md:mt-12">
          Bodies <span className="text-[#1648ff]">/</span>
          <br /> Objects <span className="text-[#1648ff]">/</span>
          <br /> Memory
        </h1>

        <div className="relative col-span-8 col-start-5 row-start-3 mt-8 self-end md:col-span-7 md:col-start-6 md:row-start-2 md:mt-20 md:self-start">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#d7d7d2]">
            {fallbackImageUrl ? (
              <Image
                src={fallbackImageUrl}
                alt={fallbackImageAlt ?? ''}
                fill
                sizes="(max-width: 768px) 72vw, 58vw"
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
          </div>
          <span className="absolute -left-8 top-1/2 h-px w-16 bg-[#1648ff]" aria-hidden="true" />
          <span
            className="absolute -left-2 top-[calc(50%-0.25rem)] text-xs text-[#1648ff]"
            aria-hidden="true"
          >
            ×
          </span>
        </div>

        <div className="col-span-12 row-start-4 mt-10 self-end md:col-span-4 md:row-start-3 md:mt-0">
          <p className="max-w-xs text-sm leading-relaxed text-black/60">
            {descriptor ?? 'Choreography, installation, and film.'}
          </p>
          <div className="mt-6 border-t border-[#1648ff] pt-3">
            <p className="text-2xl uppercase tracking-[0.16em]">
              {featuredTitle ?? 'Selected work'}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.17em] text-[#1648ff]">
              01 — 04 {featuredYear ? `/ ${featuredYear}` : ''}
            </p>
            {featuredHref ? (
              <Link
                href={featuredHref}
                className="mt-7 inline-flex items-center gap-12 text-xs uppercase tracking-[0.2em] text-[#1648ff]"
              >
                View work <span aria-hidden="true">⟶</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <a
        href="#selected-works"
        className="absolute bottom-3 right-6 text-[0.62rem] uppercase tracking-[0.2em] text-[#1648ff]"
      >
        Continue ↓
      </a>
    </section>
  )
}
