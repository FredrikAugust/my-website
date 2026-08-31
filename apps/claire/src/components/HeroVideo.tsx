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

  const moveImage = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionAllowed || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--archive-x', `${x * -5}px`)
    event.currentTarget.style.setProperty('--archive-y', `${y * -5}px`)
  }

  const resetImage = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--archive-x', '0px')
    event.currentTarget.style.setProperty('--archive-y', '0px')
  }

  return (
    <section
      className="min-h-[100svh] overflow-hidden bg-[#eff0eb] px-5 pb-9 pt-28 text-[#11110f] md:px-9 md:pb-10 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-[105rem] items-center gap-10 lg:grid-cols-[minmax(18rem,0.68fr)_minmax(0,1.55fr)] lg:gap-0">
        <div className="relative z-10 lg:pr-8">
          <h1 className="max-w-[9ch] font-heading text-[clamp(3.2rem,5.8vw,7rem)] leading-[0.91] tracking-[-0.052em] lg:-mr-28">
            {descriptor ?? 'Choreography, installation, and film.'}
          </h1>
          {featuredHref ? (
            <div className="mt-12 border-t border-black/30 pt-4 md:max-w-xs">
              <p className="text-sm text-black/52">
                {[featuredTitle, featuredYear].filter(Boolean).join(', ')}
              </p>
              <Link
                href={featuredHref}
                className="group mt-6 inline-flex items-center gap-5 text-sm text-[#355c45]"
              >
                <span className="text-link-underline">View project</span>
                <span className="stage-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        <div
          className="archive-frame relative aspect-[4/3] min-h-[50svh] overflow-hidden bg-[#d5d7d0] lg:-mr-20 lg:min-h-0"
          onPointerMove={moveImage}
          onPointerLeave={resetImage}
        >
          <div className="archive-media absolute -inset-2">
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
          </div>
        </div>
      </div>
    </section>
  )
}
