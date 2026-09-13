import Image from 'next/image'
import Link from 'next/link'

export interface WorkRowData {
  id: number
  href: string
  slug: string
  title: string
  year: number
  category: string
  medium?: string | null
  venue?: string | null
  description?: string | null
  imageUrl?: string | null
  imageAlt?: string
  imageWidth?: number | null
  imageHeight?: number | null
}

export function WorkRow({ work, reverse = false }: { work: WorkRowData; reverse?: boolean }) {
  return (
    <Link href={work.href} className={`project-row ${reverse ? 'is-reversed' : ''}`}>
      <div className="project-caption">
        <h2>
          <span className="title-highlight">{work.title}</span>
        </h2>
        <p className="metadata">
          {work.year}
          {work.medium ? ` · ${work.medium}` : ''}
        </p>
      </div>
      {work.imageUrl && (
        <Image
          src={work.imageUrl}
          alt={work.imageAlt || work.title}
          width={work.imageWidth || 1600}
          height={work.imageHeight || 1000}
          sizes="(max-width: 767px) calc(100vw - 40px), 65vw"
          className="project-image"
        />
      )}
    </Link>
  )
}
