import type { Media } from '@/payload-types'

export function WorkVideo({ video, poster }: { video: Media; poster: Media }) {
  if (!video.url || !poster.url) return null

  return (
    <figure className="space-y-2">
      <video
        controls
        playsInline
        poster={poster.url}
        preload="metadata"
        className="aspect-video w-full bg-secondary object-contain"
      >
        <source src={video.url} type="video/mp4" />
        <a href={video.url}>Open the MP4 video</a>
      </video>
      <a className="text-xs underline underline-offset-4" href={video.url}>
        Open video directly
      </a>
    </figure>
  )
}
