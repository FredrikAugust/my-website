import type { Media } from '@/payload-types'
import Image from 'next/image'

export function ProjectHero({ image }: { image: Media }) {
  if (!image?.url) return null

  return (
    <div className="relative w-full aspect-video bg-secondary">
      <Image src={image.url} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
    </div>
  )
}
