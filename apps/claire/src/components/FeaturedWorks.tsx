import Image from 'next/image'
import Link from 'next/link'
import type { WorkCardData } from './WorkCard'

export function FeaturedWorks({ works }: { works: WorkCardData[] }) {
  if (!works.length) return null

  return (
    <section
      id="selected-works"
      className="bg-[#eff0eb] px-5 py-28 text-[#11110f] md:px-9 md:py-44"
    >
      <div className="mx-auto max-w-[105rem]">
        <div className="mb-28 grid gap-8 border-t border-black/30 pt-5 md:grid-cols-[1fr_1fr] md:mb-44">
          <h2 className="font-heading text-[clamp(3.8rem,8vw,9rem)] leading-[0.88] tracking-[-0.055em]">
            Selected works
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-black/52 md:justify-self-end">
            An evolving archive of films, installations, and choreographic encounters.
          </p>
        </div>

        <div className="space-y-32 md:space-y-52">
          {works.map((work, index) => {
            const imageFirst = index % 2 === 0
            return (
              <Link
                key={work.id}
                href={work.href}
                className="group grid items-end gap-7 md:grid-cols-12 md:gap-10"
              >
                <div
                  className={`${imageFirst ? 'md:col-span-8' : 'md:order-2 md:col-span-7 md:col-start-6'} relative aspect-[4/3] overflow-hidden bg-[#d5d7d0]`}
                >
                  {work.imageUrl ? (
                    <Image
                      src={work.imageUrl}
                      alt={work.imageAlt ?? work.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 68vw"
                      className="artwork-hover object-cover grayscale"
                    />
                  ) : null}
                </div>
                <div
                  className={`${imageFirst ? 'md:col-span-4 md:pb-2' : 'md:order-1 md:col-span-4 md:pb-2'} border-t border-black/30 pt-4`}
                >
                  <p className="mb-5 text-sm text-black/50">
                    {[work.category, work.year].filter(Boolean).join(', ')}
                  </p>
                  <h3 className="max-w-[13ch] font-heading text-[clamp(2.8rem,5vw,6rem)] leading-[0.94] tracking-[-0.045em]">
                    {work.title}
                  </h3>
                  {work.subtitle ? (
                    <p className="mt-6 max-w-sm text-sm leading-relaxed text-black/52">
                      {work.subtitle}
                    </p>
                  ) : null}
                  <span className="mt-8 inline-flex items-center gap-4 text-sm text-[#355c45]">
                    <span className="text-link-underline">Open work</span>
                    <span className="stage-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-36 flex justify-end border-t border-black/30 pt-5 md:mt-52">
          <Link href="/works" className="group inline-flex items-center gap-5 text-sm">
            <span className="text-link-underline">Browse the complete archive</span>
            <span className="stage-arrow text-[#355c45]" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
