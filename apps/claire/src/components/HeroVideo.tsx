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

const words = ['Bodies', 'Objects', 'Memory'] as const

export function HeroVideo({
  videoUrl,
  videoMimeType,
  fallbackImageUrl,
  fallbackImageAlt,
  featuredHref,
  featuredTitle,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [activeWord, setActiveWord] = useState(0)

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

  const selectWord = (index: number) => {
    setActiveWord(index)
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
    video.currentTime = (video.duration / words.length) * index
  }

  return (
    <section
      className="min-h-[100svh] overflow-hidden bg-[#f2f2ee] px-5 pb-10 pt-28 text-[#10110f] md:px-9 md:pt-32"
      aria-label="Featured artwork"
    >
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-[105rem] items-start gap-12 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)] lg:gap-14 lg:pt-16">
        <div>
          <p className="mb-8 max-w-xs text-sm leading-relaxed text-black/48">
            Move through the ideas that shape Claire Foody’s practice.
          </p>
          <h1 className="flex max-w-[10ch] flex-col items-start font-heading text-[clamp(4rem,8.1vw,9.5rem)] leading-[0.78] tracking-[-0.055em]">
            {words.map((word, index) => (
              <button
                key={word}
                type="button"
                onPointerEnter={() => selectWord(index)}
                onFocus={() => selectWord(index)}
                onClick={() => selectWord(index)}
                aria-pressed={activeWord === index}
                className={`score-word ${activeWord === index ? 'is-active' : ''}`}
              >
                {word}
              </button>
            ))}
          </h1>
        </div>

        <div>
          <div className="score-frame relative aspect-[4/3] overflow-hidden bg-[#d5d6d1]">
            <div className={`score-media score-media-${activeWord} absolute -inset-4`}>
              {fallbackImageUrl ? (
                <Image
                  src={fallbackImageUrl}
                  alt={fallbackImageAlt ?? ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
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
          <div className="mt-5 flex items-start justify-between gap-6 border-t border-black/30 pt-4 text-sm">
            <div>
              <p className="font-heading text-2xl">{featuredTitle ?? 'Selected work'}</p>
              <p className="mt-2 text-black/48">Film, installation, choreography</p>
            </div>
            {featuredHref ? (
              <Link
                href={featuredHref}
                className="group inline-flex items-center gap-4 text-[#2447ff]"
              >
                <span className="text-link-underline">View work</span>
                <span className="stage-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
