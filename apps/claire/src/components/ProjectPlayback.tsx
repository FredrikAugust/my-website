import type { Media } from '@/payload-types'

import { VimeoEmbed } from './VimeoEmbed'
import { WorkVideo } from './WorkVideo'

interface PlaybackSource {
  video?: number | Media | null
  videoPoster?: number | Media | null
  vimeoUrl?: string | null
}

export function ProjectPlayback({ source }: { source: PlaybackSource }) {
  const video = typeof source.video === 'object' ? source.video : null
  const poster = typeof source.videoPoster === 'object' ? source.videoPoster : null

  if (video?.url && poster?.url) return <WorkVideo video={video} poster={poster} />
  if (source.vimeoUrl) return <VimeoEmbed url={source.vimeoUrl} />
  return null
}
