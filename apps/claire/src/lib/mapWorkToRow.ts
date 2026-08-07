import type { WorkRowData } from '@/components/WorkRow'
import type { Media } from '@/payload-types'
import { extractPlainText } from './richtext'

interface WorkForRow {
  id: number
  slug: string
  title: string
  year: number
  category: string
  medium?: string | null
  venue?: string | null
  description?: unknown
  thumbnailImage?: number | Media | null
  heroImage?: number | Media | null
}

export function mapWorkToRow(work: WorkForRow): WorkRowData {
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
    description: work.description ? extractPlainText(work.description) : null,
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt,
  }
}
