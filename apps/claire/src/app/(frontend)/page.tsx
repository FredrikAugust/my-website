import { AboutPractice } from '@/components/AboutPractice'
import { FeaturedWorks } from '@/components/FeaturedWorks'
import { HeroVideo } from '@/components/HeroVideo'
import { Navigation } from '@/components/Navigation'
import { getPayloadClient } from '@/lib/payload'
import { mapProjectToCard } from '@/lib/projects'
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

  const home = await payload.findGlobal({ slug: 'home', depth: 2 })

  const heroVideo = home.hero?.video as MediaType | null
  const fallbackImage = home.hero?.fallbackImage as MediaType | null
  const works = (home.featuredProjects ?? []).flatMap((relation) => {
    if (typeof relation.value !== 'object' || relation.value._status !== 'published') return []
    const kind =
      relation.relationTo === 'films'
        ? 'film'
        : relation.relationTo === 'exhibitions'
          ? 'exhibition'
          : 'installation'
    return [mapProjectToCard(kind, relation.value)]
  })
  const featuredWork = works.at(0)

  return (
    <>
      <Navigation variant="light" />
      <HeroVideo
        videoUrl={heroVideo?.url}
        videoMimeType={heroVideo?.mimeType}
        fallbackImageUrl={fallbackImage?.url}
        fallbackImageAlt={fallbackImage?.alt}
        descriptor={home.hero?.descriptor}
        featuredHref={featuredWork?.href}
        featuredTitle={featuredWork?.title}
      />
      <FeaturedWorks works={works} />
      <AboutPractice quote={home.aboutPractice?.quote} body={home.aboutPractice?.body} />
    </>
  )
}
