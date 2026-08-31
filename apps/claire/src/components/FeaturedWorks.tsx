import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'
import { WorkCard } from './WorkCard'

export function FeaturedWorks({
  works,
  descriptor,
}: {
  works: WorkCardData[]
  descriptor?: string | null
}) {
  if (!works.length) return null

  const [first, ...rest] = works

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
        Selected Works
      </p>
      {descriptor && (
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-16">
          {descriptor}
        </h2>
      )}

      {first && (
        <Link href={first.href} className="group block mb-16">
          {first.imageUrl && (
            <div className="aspect-video relative overflow-hidden bg-secondary mb-6">
              <Image
                src={first.imageUrl}
                alt={first.imageAlt ?? first.title}
                fill
                priority
                sizes="100vw"
                className="artwork-hover object-cover"
              />
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-1 flex-col">
            <span className="text-muted-foreground">{first.year}</span>
            <div className="flex md:flex-row flex-col gap-4 justify-between w-full">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-2xl md:text-3xl tracking-tight group-hover:text-foreground transition-colors">
                  {first.title}
                </h3>
                <span className="text-md capitalize text-muted-foreground">{first.category}</span>
              </div>
              <p className="text-muted-foreground max-w-sm text-md">{first.subtitle}</p>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 mb-16">
          {rest.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}

      <div className="text-right">
        <Link
          href="/works"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          View all work &rarr;
        </Link>
      </div>
    </section>
  )
}
