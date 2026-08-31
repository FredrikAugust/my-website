import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'
import { WorkCard } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  const [first, ...rest] = works

  return (
    <section id="selected-works" className="bg-[#f2efe7] px-6 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-16 grid gap-5 border-t border-black/30 pt-5 md:grid-cols-[1fr_2fr] md:mb-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7e332b]">Selected works</p>
          <h2 className="max-w-[15ch] font-heading text-4xl leading-[0.96] tracking-[-0.035em] md:text-6xl">
            An index of bodies, objects, and remembered places.
          </h2>
        </div>

        {first && (
          <Link href={first.href} className="group mb-24 grid gap-5 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-between border-t border-black/25 py-4 text-xs uppercase tracking-[0.17em]">
              <span>01 / Featured</span>
              <div className="mt-12">
                <p className="text-[#7e332b]">{first.category}</p>
                <p>{first.year}</p>
              </div>
            </div>
            <div>
              {first.imageUrl && (
                <div className="relative mb-5 aspect-video overflow-hidden bg-[#d8d4cb]">
                  <Image
                    src={first.imageUrl}
                    alt={first.imageAlt ?? first.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 70vw"
                    className="artwork-hover object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-baseline">
                <h3 className="font-heading text-3xl tracking-tight md:text-5xl">{first.title}</h3>
                <p className="max-w-sm text-sm text-black/60">{first.subtitle}</p>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mb-24 grid grid-cols-1 gap-x-10 gap-y-20 border-t border-black/25 pt-5 md:grid-cols-12">
            {rest.map((work, index) => (
              <div
                key={work.id}
                className={index % 2 === 0 ? 'md:col-span-7' : 'md:col-span-5 md:pt-28'}
              >
                <p className="mb-4 text-xs uppercase tracking-[0.17em] text-[#7e332b]">
                  0{index + 2} / {work.category}
                </p>
                <WorkCard work={work} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-black/25 pt-5">
          <Link href="/works" className="text-link-underline text-xs uppercase tracking-[0.2em]">
            View all work &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
