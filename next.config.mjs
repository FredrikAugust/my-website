import { withPayload } from "@payloadcms/next/withPayload";

const s3Hostname = process.env.S3_ENDPOINT ? new URL(process.env.S3_ENDPOINT).hostname : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      ...(s3Hostname ? [{ protocol: /** @type {const} */ ("https"), hostname: s3Hostname }] : []),
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "fredrikmalmo.com" },
    ],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
