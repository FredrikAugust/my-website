import { withPayload } from '@payloadcms/next/withPayload'

const mediaUrl = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : undefined
const localMediaFallbackUrl = process.env.LOCAL_MEDIA_FALLBACK_URL
  ? new URL(process.env.LOCAL_MEDIA_FALLBACK_URL)
  : undefined
const serverUrl = process.env.SERVER_URL ? new URL(process.env.SERVER_URL) : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
