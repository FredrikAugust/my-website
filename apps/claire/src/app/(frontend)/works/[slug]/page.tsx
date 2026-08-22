import { getPayloadClient } from '@/lib/payload'
import { legacyProjectRoutes } from '@/lib/legacyRoutes'
import { notFound, permanentRedirect } from 'next/navigation'

type PageProps = { params: Promise<{ slug: string }> }

export default async function LegacyWorkRedirect({ params }: PageProps) {
  const { slug } = await params
  const target = legacyProjectRoutes[slug as keyof typeof legacyProjectRoutes]
  if (!target) notFound()
  if (target.startsWith('/dance')) permanentRedirect(target)

  const payload = await getPayloadClient()
  const [section, destinationSlug] = target.split('/').filter(Boolean)
  const collection =
    section === 'film' ? 'films' : section === 'exhibitions' ? 'exhibitions' : 'installations'
  const result = await payload.find({
    collection,
    where: { and: [{ slug: { equals: destinationSlug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  })
  if (!result.docs[0]) notFound()
  permanentRedirect(target)
}
