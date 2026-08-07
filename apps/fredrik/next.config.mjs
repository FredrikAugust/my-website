import { withPayload } from '@payloadcms/next/withPayload'

const mediaHostname = process.env.S3_PUBLIC_URL
  ? new URL(process.env.S3_PUBLIC_URL).hostname
  : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(mediaHostname
        ? [{ protocol: /** @type {const} */ ('https'), hostname: mediaHostname }]
        : []),
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'fredrikmalmo.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
