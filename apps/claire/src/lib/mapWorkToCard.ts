import type { WorkCardData } from '@/components/WorkCard'
import type { Media } from '@/payload-types'

interface WorkForCard {
  id: number
  slug: string
  title: string
  year: number
  category: string
  medium?: string | null
  venue?: string | null
  thumbnailImage?: number | Media | null
  heroImage?: number | Media | null
  subtitle?: string | null
}

export function mapWorkToCard(work: WorkForCard): WorkCardData {
  const thumbnail = work.thumbnailImage as Media | null
  const hero = work.heroImage as Media | null
  const image = thumbnail || hero

  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    year: work.year,
    category: work.category,
    medium: work.medium,
    venue: work.venue,
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt,
    subtitle: work?.subtitle,
  }
}
