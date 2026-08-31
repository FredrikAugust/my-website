import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'
import { WorkCard } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  const [first, ...rest] = works

  return (
    <section id="selected-works" className="score-grid bg-[#f4f3ee] px-6 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-16 grid grid-cols-12 border-y border-black/25 py-4 text-xs uppercase tracking-[0.18em] md:mb-24">
          <p className="col-span-5 text-[#1648ff]">Index / Selected works</p>
          <p className="col-span-7 text-right">Three movements in space</p>
        </div>

        {first && (
          <Link href={first.href} className="group mb-28 grid grid-cols-12 gap-x-4 md:gap-x-6">
            <div className="col-span-12 mb-5 md:col-span-4 md:mb-0 md:flex md:flex-col md:justify-between">
              <div>
                <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#1648ff]">
                  Movement 01
                </p>
                <h3 className="font-heading text-5xl uppercase leading-[0.9] tracking-[0.04em] md:text-7xl">
                  {first.title}
                </h3>
              </div>
              <div className="mt-8 border-t border-[#1648ff] pt-3 text-xs uppercase tracking-[0.17em]">
                <p>{first.category}</p>
                <p>{first.year}</p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              {first.imageUrl && (
                <div className="relative aspect-video overflow-hidden bg-[#d7d7d2]">
                  <Image
                    src={first.imageUrl}
                    alt={first.imageAlt ?? first.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 68vw"
                    className="artwork-hover object-cover"
                  />
                </div>
              )}
              <p className="mt-4 max-w-md text-sm text-black/60">{first.subtitle}</p>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mb-24 grid grid-cols-12 gap-x-4 gap-y-20 border-y border-black/25 py-10 md:gap-x-6">
            {rest.map((work, index) => (
              <div
                key={work.id}
                className={
                  index % 2 === 0
                    ? 'col-span-10 md:col-span-6'
                    : 'col-span-9 col-start-4 md:col-span-5 md:col-start-8 md:pt-32'
                }
              >
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#1648ff]">
                  Movement 0{index + 2} / axis {index % 2 === 0 ? 'x' : 'y'}
                </p>
                <WorkCard work={work} />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#1648ff]">
          <span>Score continues</span>
          <Link href="/works" className="text-link-underline">
            Complete index ⟶
          </Link>
        </div>
      </div>
    </section>
  )
}
