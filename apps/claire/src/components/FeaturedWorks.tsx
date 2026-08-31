import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'
import { WorkCard } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  const [first, ...rest] = works

  return (
    <section
      id="selected-works"
      className="bg-[#f0ede6] px-6 py-24 text-[#121212] md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-20 flex items-end justify-between gap-8 border-t border-black/30 pt-5 md:mb-28">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.2em] text-[#b64e25]">Scenes / 01—03</p>
            <h2 className="font-heading text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
              Selected works
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-relaxed text-black/55 md:block">
            Bodies enter, objects hold their ground, and each image keeps the trace of an action.
          </p>
        </div>

        {first && (
          <Link href={first.href} className="group mb-28 block">
            {first.imageUrl && (
              <div className="relative mb-6 aspect-[16/8] overflow-hidden bg-[#d4d0c8]">
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
            <div className="grid gap-4 border-t border-black/25 pt-4 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#b64e25]">Scene 01</p>
                <h3 className="font-heading text-4xl tracking-[-0.03em] md:text-6xl">
                  {first.title}
                </h3>
              </div>
              <div className="flex justify-between gap-6 text-sm text-black/55">
                <p className="max-w-sm">{first.subtitle}</p>
                <p className="shrink-0 text-xs uppercase tracking-[0.17em]">
                  {first.category}
                  <br />
                  {first.year}
                </p>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mb-28 grid gap-x-14 gap-y-20 md:grid-cols-12">
            {rest.map((work, index) => (
              <div
                key={work.id}
                className={index % 2 === 0 ? 'md:col-span-7' : 'md:col-span-5 md:pt-40'}
              >
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#b64e25]">
                  Scene 0{index + 2}
                </p>
                <WorkCard work={work} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-black/25 pt-5">
          <Link href="/works" className="text-link-underline text-xs uppercase tracking-[0.2em]">
            Enter the full programme →
          </Link>
        </div>
      </div>
    </section>
  )
}
