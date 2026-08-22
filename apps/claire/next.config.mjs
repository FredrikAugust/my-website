import { withPayload } from '@payloadcms/next/withPayload'

const mediaUrl = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : undefined
const localMediaFallbackUrl = process.env.LOCAL_MEDIA_FALLBACK_URL
  ? new URL(process.env.LOCAL_MEDIA_FALLBACK_URL)
  : undefined
const serverUrl = process.env.SERVER_URL ? new URL(process.env.SERVER_URL) : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/works', destination: '/exhibitions', permanent: true },
      { source: '/performance', destination: '/dance', permanent: true },
      { source: '/contact', destination: '/about#contact', permanent: true },
      { source: '/works/saudade', destination: '/exhibitions/saudade', permanent: true },
      { source: '/works/on-repeat', destination: '/exhibitions/on-repeat', permanent: true },
      {
        source: '/works/tides-and-threads',
        destination: '/exhibitions/tides-and-threads',
        permanent: true,
      },
      {
        source: '/works/wish-you-were-here',
        destination: '/film/wish-you-were-here',
        permanent: true,
      },
      { source: '/works/centrifuge', destination: '/film/centrifuge', permanent: true },
      { source: '/works/thepace', destination: '/dance#thepace', permanent: true },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(serverUrl
        ? [{ protocol: serverUrl.protocol.slice(0, -1), hostname: serverUrl.hostname }]
        : []),
      ...(mediaUrl
        ? [{ protocol: mediaUrl.protocol.slice(0, -1), hostname: mediaUrl.hostname }]
        : []),
      ...(localMediaFallbackUrl
        ? [
            {
              protocol: localMediaFallbackUrl.protocol.slice(0, -1),
              hostname: localMediaFallbackUrl.hostname,
            },
          ]
        : []),
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
