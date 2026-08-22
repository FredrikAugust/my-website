import { Credits } from '@/components/Credits'
import { Navigation } from '@/components/Navigation'
import { ProjectPlayback } from '@/components/ProjectPlayback'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { cache } from 'react'

export const revalidate = 60

const getDance = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'dance', depth: 1 })
})

export async function generateMetadata(): Promise<Metadata> {
  const dance = await getDance()
  const image = dance.selectedStageWorks?.find((item) => typeof item.image === 'object')?.image as
    | Media
    | undefined
  const description =
    "Claire Foody's professional dance career, showreel, performance footage, and selected stage work."
  return {
    title: 'Dance',
    description,
    alternates: { canonical: '/dance' },
    openGraph: {
      title: 'Dance',
      description,
      url: '/dance',
      images: image?.url
        ? [
            {
              url: image.url,
              alt: image.alt,
              width: image.width ?? undefined,
              height: image.height ?? undefined,
            },
          ]
        : undefined,
    },
  }
}

export default async function DancePage() {
  const dance = await getDance()
  const hasShowreel = dance.showreel?.video || dance.showreel?.vimeoUrl

  return (
    <>
      <Navigation />
      <section className="mx-auto max-w-7xl px-6 py-24">
        <header className="mb-16 max-w-4xl">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Professional Practice
          </p>
          <h1 className="text-balance font-heading text-5xl tracking-tight md:text-7xl">
            {dance.heading || 'Dance'}
          </h1>
          {dance.introduction ? (
            <div className="mt-8 max-w-3xl text-lg leading-relaxed text-foreground/80">
              <RichText data={dance.introduction} />
            </div>
          ) : null}
        </header>

        {hasShowreel ? (
          <section className="mb-24" aria-labelledby="showreel-heading">
            <h2
              id="showreel-heading"
              className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Showreel
            </h2>
            <ProjectPlayback source={dance.showreel ?? {}} />
          </section>
        ) : null}

        {dance.performanceFootage?.length ? (
          <section className="mb-24" aria-labelledby="footage-heading">
            <h2
              id="footage-heading"
              className="mb-10 font-heading text-3xl tracking-tight md:text-4xl"
            >
              Performance Footage
            </h2>
            <div className="space-y-20">
              {dance.performanceFootage.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]"
                >
                  <ProjectPlayback source={item} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {item.year}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl tracking-tight">{item.title}</h3>
                    {item.description ? (
                      <div className="mt-4 text-foreground/75">
                        <RichText data={item.description} />
                      </div>
                    ) : null}
                    <div className="mt-6">
                      <Credits credits={item.credits} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="stage-heading">
          <h2 id="stage-heading" className="mb-10 font-heading text-3xl tracking-tight md:text-4xl">
            Selected Stage Work
          </h2>
          {dance.selectedStageWorks?.length ? (
            <div className="space-y-20">
              {dance.selectedStageWorks.map((item, index) => {
                const image = typeof item.image === 'object' ? (item.image as Media) : null
                return (
                  <article
                    id={item.anchor}
                    key={item.id}
                    className="scroll-mt-24 grid gap-10 border-t border-border pt-10 lg:grid-cols-2"
                  >
                    {image?.url ? (
                      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {item.dateOrYear}
                      </p>
                      <h3 className="mt-2 text-balance font-heading text-3xl tracking-tight">
                        {item.title}
                      </h3>
                      {item.companyOrVenue ? (
                        <p className="mt-2 text-muted-foreground">{item.companyOrVenue}</p>
                      ) : null}
                      {item.role ? (
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      ) : null}
                      {item.description ? (
                        <div className="mt-6 text-foreground/75">
                          <RichText data={item.description} />
                        </div>
                      ) : null}
                      <div className="mt-8">
                        <ProjectPlayback source={item} />
                      </div>
                      <div className="mt-8">
                        <Credits credits={item.credits} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Selected stage work will be added here.</p>
          )}
        </section>
      </section>
    </>
  )
}
