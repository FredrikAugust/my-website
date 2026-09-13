import { Arrow } from '@/components/Arrow'
import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import { workCategories } from '@/lib/workCategories'
import type { Media } from '@/payload-types'
import type { Metadata } from 'next'

export const revalidate = 60
export const metadata: Metadata = { title: 'Claire Foody', alternates: { canonical: '/' } }

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, installations, exhibitions, films, dance] = await Promise.all([
    payload.findGlobal({ slug: 'home', depth: 1 }),
    payload.find({
      collection: 'installations',
      where: { _status: { equals: 'published' } },
      sort: ['sortOrder', '-id'],
      limit: 1,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'exhibitions',
      where: { _status: { equals: 'published' } },
      sort: ['sortOrder', '-id'],
      limit: 1,
      depth: 1,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'films',
      where: { _status: { equals: 'published' } },
      sort: ['sortOrder', '-id'],
      limit: 1,
      depth: 1,
      overrideAccess: false,
    }),
    payload.findGlobal({ slug: 'dance', depth: 1 }),
  ])
  const cover = (project?: {
    heroImage?: number | Media | null
    thumbnailImage?: number | Media | null
  }) => (project?.heroImage || project?.thumbnailImage) as Media | null
  const images = [
    cover(installations.docs[0]),
    cover(exhibitions.docs[0]),
    (dance.showreel?.videoPoster ||
      dance.selectedStageWorks?.find((work) => typeof work.image === 'object')
        ?.image) as Media | null,
    cover(films.docs[0]),
  ]
  const opening = home.hero?.fallbackImage as Media | null
  return (
    <>
      <Navigation />
      <section className="site-shell home-opening">
        <div className="opening-title">
          <h1 className="artist-title">
            <span>Claire</span> <span>Foody</span>
          </h1>
          <p className="opening-descriptor">
            Multidisciplinary artist
            <br />
            and professional dancer
          </p>
        </div>
        {opening?.url && (
          <Image
            src={opening.url}
            alt={opening.alt || 'Claire Foody dancing'}
            width={opening.width || 1200}
            height={opening.height || 1600}
            priority
            sizes="(max-width: 767px) calc(100vw - 40px), 50vw"
            className="opening-image"
          />
        )}
      </section>
      <section className="home-work" aria-labelledby="work-heading">
        <div className="site-shell">
          <h2 id="work-heading" className="section-label">
            Work
          </h2>
          {workCategories.map((category, index) => {
            const media = images[index]
            return (
              <Link href={category.href} key={category.href} className="category-chapter">
                <h3>
                  <span className="title-highlight">{category.label}</span>
                  <Arrow />
                </h3>
                {media?.url && (
                  <Image
                    src={media.url}
                    alt={media.alt || category.label}
                    width={media.width || 1600}
                    height={media.height || 1000}
                    sizes="(max-width: 767px) calc(100vw - 40px), 65vw"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
