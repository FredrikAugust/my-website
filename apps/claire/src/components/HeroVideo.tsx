'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface HeroVideoProps {
  videoUrl?: string | null
  videoMimeType?: string | null
  fallbackImageUrl?: string | null
  fallbackImageAlt?: string
}

export function HeroVideo({
  videoUrl,
  videoMimeType,
  fallbackImageUrl,
  fallbackImageAlt,
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
      className="relative h-screen w-full overflow-hidden bg-foreground"
      aria-label="Featured artwork"
    >
      {fallbackImageUrl ? (
        <Image
          src={fallbackImageUrl}
          alt={fallbackImageAlt ?? ''}
          fill
          sizes="100vw"
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
      <div className="absolute inset-0 bg-foreground/30" />
    </section>
  )
}
