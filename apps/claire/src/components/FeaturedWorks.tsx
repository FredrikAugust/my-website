import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  return (
    <section
      id="selected-works"
      className="overflow-hidden bg-[#f2f2ee] py-28 text-[#10110f] md:py-44"
    >
      <div className="mb-20 grid gap-8 px-5 md:grid-cols-[1fr_1fr] md:px-9">
        <h2 className="font-heading text-[clamp(3.8rem,8vw,9rem)] leading-[0.88] tracking-[-0.055em]">
          Works in motion
        </h2>
        <p className="max-w-md border-t border-black/30 pt-4 text-lg leading-relaxed text-black/48 md:justify-self-end">
          Each work changes according to the room, the body, and the person looking.
        </p>
      </div>

      <div className="score-rail flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-10 md:gap-9 md:px-9">
        {works.map((work, index) => (
          <Link
            key={work.id}
            href={work.href}
            className="group w-[84vw] shrink-0 snap-start md:w-[66vw] lg:w-[52vw]"
          >
            <div
              className={`${index % 2 ? 'aspect-[4/3]' : 'aspect-[16/10]'} relative overflow-hidden bg-[#d5d6d1]`}
            >
              {work.imageUrl ? (
                <Image
                  src={work.imageUrl}
                  alt={work.imageAlt ?? work.title}
                  fill
                  sizes="(max-width: 768px) 84vw, 55vw"
                  className="artwork-hover object-cover grayscale"
                />
              ) : null}
            </div>
            <div className="mt-5 flex items-start justify-between gap-8 border-t border-black/30 pt-4">
              <div>
                <h3 className="font-heading text-[clamp(2.6rem,4.5vw,5.5rem)] leading-[0.95] tracking-[-0.045em]">
                  {work.title}
                </h3>
                <p className="mt-3 text-sm text-black/48">
                  {[work.category, work.year].filter(Boolean).join(', ')}
                </p>
              </div>
              <span className="stage-arrow text-2xl text-[#2447ff]" aria-hidden="true">
                ↗
              </span>
            </div>
          </Link>
        ))}
        <div className="flex w-[16vw] shrink-0 snap-end items-end pb-12 md:w-[24vw]">
          <Link
            href="/works"
            className="group inline-flex items-center gap-5 text-sm text-[#2447ff]"
          >
            <span className="text-link-underline">All works</span>
            <span className="stage-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
