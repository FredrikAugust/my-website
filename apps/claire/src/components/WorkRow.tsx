import Image from 'next/image'
import Link from 'next/link'

export interface WorkRowData {
  id: number
  slug: string
  title: string
  year: number
  category: string
  medium?: string | null
  venue?: string | null
  description?: string | null
  imageUrl?: string | null
  imageAlt?: string
}

interface WorkRowProps {
  work: WorkRowData
  reverse?: boolean
}

export function WorkRow({ work, reverse = false }: WorkRowProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 ${reverse ? 'lg:[direction:rtl]' : ''}`}
    >
      <Link href={`/works/${work.slug}`} className="group block lg:[direction:ltr]">
        {work.imageUrl && (
          <div className="aspect-4/3 relative overflow-hidden bg-secondary">
            <Image
              src={work.imageUrl}
              alt={work.imageAlt ?? work.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-center lg:[direction:ltr]">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {work.year}
          </span>
          <span className="text-muted-foreground/40">&mdash;</span>
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {work.category}
          </span>
        </div>

        <Link href={`/works/${work.slug}`} className="group">
          <h2 className="font-heading text-3xl md:text-4xl tracking-tight mb-3 uppercase group-hover:text-muted-foreground transition-colors">
            {work.title}
          </h2>
        </Link>

        {work.venue && <p className="text-sm text-muted-foreground mb-2">{work.venue}</p>}
        {work.medium && <p className="text-sm text-muted-foreground mb-4">{work.medium}</p>}

        {work.description && (
          <p className="text-foreground/70 leading-relaxed mb-6">{work.description}</p>
        )}

        <Link
          href={`/works/${work.slug}`}
          className="inline-block text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
        >
          View Project &rarr;
        </Link>
      </div>
    </div>
  )
}
