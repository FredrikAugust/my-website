import type { Media } from '@/payload-types'
import Image from 'next/image'

interface GalleryItem {
  image: number | Media
  caption?: string | null
  id?: string | null
}

export function ImageGallery({ images }: { images: GalleryItem[] }) {
  return (
    <div className="columns-1 md:columns-2 gap-4 space-y-4">
      {images.map((item) => {
        const img = item.image as Media
        if (!img?.url) return null
        return (
          <figure key={item.id} className="break-inside-avoid">
            <div className="relative overflow-hidden bg-secondary">
              <Image
                src={img.url}
                alt={img.alt}
                width={img.width ?? 800}
                height={img.height ?? 600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-auto"
              />
            </div>
            {item.caption && (
              <figcaption className="mt-2 text-xs text-muted-foreground">{item.caption}</figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
