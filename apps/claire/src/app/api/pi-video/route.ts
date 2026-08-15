import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const videoFieldByDevice = {
  pi1: 'pi1Video',
  pi2: 'pi2Video',
  pi3: 'pi3Video',
} as const

export async function GET(request: Request) {
  const device = new URL(request.url).searchParams.get('device')

  if (!device || !(device in videoFieldByDevice)) {
    return Response.json(
      { error: 'Unknown Pi display.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const payload = await getPayloadClient()
  const playback = await payload.findGlobal({ slug: 'pi-playback', depth: 1 })
  const video = playback[videoFieldByDevice[device as keyof typeof videoFieldByDevice]]

  if (!video || typeof video === 'number' || !video.url) {
    return Response.json({ video: null }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return Response.json(
    {
      video: {
        id: video.id,
        updatedAt: video.updatedAt,
        url: video.url,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
