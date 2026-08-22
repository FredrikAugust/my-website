import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'

const safeFilename = (value?: string | null) => {
  const filename = value?.replace(/[^a-zA-Z0-9._-]/g, '-') || 'Claire-Foody-CV.pdf'
  return filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
}

export async function GET() {
  const payload = await getPayloadClient()
  const cv = await payload.findGlobal({ slug: 'cv', depth: 1 })
  const pdf = typeof cv.fullPdf === 'object' ? (cv.fullPdf as Media) : null
  if (!pdf?.url || pdf.mimeType !== 'application/pdf') {
    return new Response('The full CV PDF is not currently available.', { status: 404 })
  }

  const upstream = await fetch(pdf.url)
  if (!upstream.ok || !upstream.body) {
    return new Response('The CV PDF could not be retrieved. Please try again later.', {
      status: 502,
    })
  }

  const headers = new Headers({
    'Content-Disposition': `attachment; filename="${safeFilename(cv.downloadFilename)}"`,
    'Content-Type': 'application/pdf',
  })
  const length = upstream.headers.get('content-length')
  if (length) headers.set('Content-Length', length)
  return new Response(upstream.body, { status: 200, headers })
}
