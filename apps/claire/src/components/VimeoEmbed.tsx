export function VimeoEmbed({ url }: { url: string }) {
  const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
  if (!videoId) return null

  return (
    <div className="relative w-full aspect-video bg-secondary">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?dnt=1`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Video"
      />
    </div>
  )
}
