import type { Media } from '@/payload-types'
import Image from 'next/image'
import { ImageZoom } from './ImageZoom'

export function ProjectHero({ image }: { image: Media }) {
  if (!image?.url) return null
  return (
    <div className="project-hero">
      <ImageZoom src={image.url}>
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width || 1600}
          height={image.height || 900}
          priority
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1416px) 62vw, 840px"
        />
      </ImageZoom>
    </div>
  )
}
