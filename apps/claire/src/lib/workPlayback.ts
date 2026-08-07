import type { Media, Work } from '@/payload-types'

export type WorkPlayback =
  | { type: 'upload'; video: Media; poster: Media }
  | { type: 'vimeo'; url: string }
  | null

export function selectWorkPlayback(
  work: Pick<Work, 'video' | 'videoPoster' | 'vimeoUrl'>,
): WorkPlayback {
  const video = typeof work.video === 'object' ? work.video : null
  const poster = typeof work.videoPoster === 'object' ? work.videoPoster : null
  if (video?.url && poster?.url) return { type: 'upload', video, poster }
  if (work.vimeoUrl) return { type: 'vimeo', url: work.vimeoUrl }
  return null
}
