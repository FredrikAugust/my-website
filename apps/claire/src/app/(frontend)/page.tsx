import { AboutPractice } from '@/components/AboutPractice'
import { FeaturedWorks } from '@/components/FeaturedWorks'
import { HeroVideo } from '@/components/HeroVideo'
import { Navigation } from '@/components/Navigation'
import { mapWorkToCard } from '@/lib/mapWorkToCard'
import { getPayloadClient } from '@/lib/payload'
import type { Media as MediaType } from '@/payload-types'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Claire Foody',
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [home, worksResult] = await Promise.all([
    payload.findGlobal({ slug: 'home', depth: 1 }),
    payload.find({
      collection: 'works',
      where: { featured: { equals: true } },
      sort: 'sortOrder',
      limit: 3,
      depth: 1,
      select: {
        title: true,
        slug: true,
        year: true,
        category: true,
        medium: true,
        venue: true,
        thumbnailImage: true,
        heroImage: true,
        subtitle: true,
      },
    }),
  ])

  const heroVideo = home.hero?.video as MediaType | null
  const fallbackImage = home.hero?.fallbackImage as MediaType | null

  return (
    <>
      <Navigation variant="light" />
      <HeroVideo
        videoUrl={heroVideo?.url}
        videoMimeType={heroVideo?.mimeType}
        fallbackImageUrl={fallbackImage?.url}
        fallbackImageAlt={fallbackImage?.alt}
      />
      <FeaturedWorks
        works={worksResult.docs.map(mapWorkToCard)}
        descriptor={home.hero?.descriptor}
      />
      <AboutPractice quote={home.aboutPractice?.quote} body={home.aboutPractice?.body} />
    </>
  )
}
