import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  return (
    <section id="selected-works" className="bg-[#070707] text-[#f3f1ea]">
      <div className="flex min-h-[55svh] items-end px-5 pb-14 pt-32 md:px-9 md:pb-20">
        <div className="grid w-full gap-7 border-t border-white/20 pt-5 md:grid-cols-[1fr_1fr]">
          <h2 className="font-heading text-[clamp(3.8rem,8vw,9rem)] leading-[0.88] tracking-[-0.055em]">
            Selected works
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-[#f3f1ea]/48 md:justify-self-end">
            Bodies enter, objects hold their ground, and each image keeps the trace of an action.
          </p>
        </div>
      </div>

      <div>
        {works.map((work) => (
          <Link
            key={work.id}
            href={work.href}
            className="group relative block min-h-[82svh] overflow-hidden border-t border-white/15 bg-[#111]"
          >
            {work.imageUrl ? (
              <Image
                src={work.imageUrl}
                alt={work.imageAlt ?? work.title}
                fill
                sizes="100vw"
                className="artwork-hover object-cover grayscale brightness-[0.72] contrast-110"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/15" />
            <div className="absolute inset-x-0 bottom-0 grid items-end gap-6 px-5 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:px-9 md:pb-10">
              <div>
                <p className="mb-3 text-sm text-white/55">
                  {[work.category, work.year].filter(Boolean).join(', ')}
                </p>
                <h3 className="max-w-[13ch] font-heading text-[clamp(3.2rem,7vw,8rem)] leading-[0.9] tracking-[-0.05em]">
                  {work.title}
                </h3>
              </div>
              <span className="stage-arrow mb-2 text-4xl text-[#ff532e]" aria-hidden="true">
                ↗
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-end border-t border-white/20 px-5 py-9 md:px-9">
        <Link href="/works" className="group inline-flex items-center gap-5 text-sm">
          <span className="text-link-underline">See every work</span>
          <span className="stage-arrow text-[#ff532e]" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
    </section>
  )
}
