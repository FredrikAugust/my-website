'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { PointerEvent } from 'react'
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

  const moveProjection = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionAllowed || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--tilt-x', `${y * -1.2}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${x * 1.6}deg`)
    event.currentTarget.style.setProperty('--drift-x', `${x * 5}px`)
    event.currentTarget.style.setProperty('--drift-y', `${y * 5}px`)
  }

  const resetProjection = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
    event.currentTarget.style.setProperty('--drift-x', '0px')
    event.currentTarget.style.setProperty('--drift-y', '0px')
  }

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-[#070707] px-5 pb-9 pt-28 text-[#f3f1ea] md:px-9 md:pb-10 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-[105rem] items-center gap-10 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.5fr)] lg:gap-7">
        <div className="relative z-10 lg:pr-3">
          <p className="mb-7 font-heading text-xl text-[#f3f1ea]/48">A practice in motion</p>
          <h1 className="max-w-[9ch] font-heading text-[clamp(3.05rem,6.2vw,7.25rem)] leading-[0.91] tracking-[-0.052em]">
            {descriptor ?? 'Choreography, installation, and film.'}
          </h1>
          {featuredHref ? (
            <Link
              href={featuredHref}
              className="group mt-11 inline-flex items-center gap-5 text-sm text-[#ff532e]"
            >
              <span className="text-link-underline">Enter {featuredTitle ?? 'selected work'}</span>
              <span className="stage-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ) : null}
        </div>

        <div className="relative lg:-mr-20">
          <div
            className="stage-projection relative aspect-[16/9] overflow-hidden bg-[#181818]"
            onPointerMove={moveProjection}
            onPointerLeave={resetProjection}
          >
            {fallbackImageUrl ? (
              <Image
                src={fallbackImageUrl}
                alt={fallbackImageAlt ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
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
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_60%,rgb(255_255_255/0.08))]" />
          </div>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-[#f3f1ea]/42">
            Moving image, choreography, and objects held in the same frame.
          </p>
        </div>
      </div>
    </section>
  )
}
