import { Navigation } from '@/components/Navigation'
import { ProjectHero } from '@/components/ProjectHero'
import { ProjectInfo } from '@/components/ProjectInfo'
import { ProjectNavigation } from '@/components/ProjectNavigation'
import { getPayloadClient } from '@/lib/payload'
import type { Media as MediaType } from '@/payload-types'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

const getWork = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'works',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)

  if (!work) return { title: 'Not Found' }

  return {
    title: work.title,
    description: work.subtitle ?? `${work.title} — ${work.category}, ${work.year}`,
    alternates: { canonical: `/works/${slug}` },
  }
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const works = await payload.find({
    collection: 'works',
    limit: 1000,
    depth: 0,
    pagination: false,
    select: { slug: true },
  })
  return works.docs.map((work) => ({ slug: work.slug }))
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  const payload = await getPayloadClient()
  const nextResult = await payload.find({
    collection: 'works',
    where: {
      sortOrder: { greater_than: work.sortOrder ?? 0 },
      id: { not_equals: work.id },
    },
    sort: 'sortOrder',
    limit: 1,
    depth: 0,
    select: { title: true, slug: true },
  })

  const heroImage = work.heroImage as MediaType | null

  return (
    <>
      <Navigation />
      {heroImage && <ProjectHero image={heroImage} />}
      <ProjectInfo work={work} />
      <ProjectNavigation nextWork={nextResult.docs[0] ?? null} category={work.category} />
    </>
  )
}
