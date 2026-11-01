import { S3Client } from '@aws-sdk/client-s3'

export type R2Config = {
  accessKeyId: string
  bucket: string
  endpoint: string
  region: string
  secretAccessKey: string
}

export function readR2Config(env: NodeJS.ProcessEnv = process.env): R2Config | undefined {
  const { S3_ACCESS_KEY_ID, S3_BUCKET, S3_ENDPOINT, S3_SECRET_ACCESS_KEY } = env
  if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return undefined
  return {
    accessKeyId: S3_ACCESS_KEY_ID,
    bucket: S3_BUCKET,
    endpoint: S3_ENDPOINT,
    region: env.S3_REGION || 'auto',
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  }
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: true,
    region: config.region,
    // Browser PUTs do not send the checksum headers the SDK adds by default.
    // WHEN_REQUIRED keeps presigned uploads and server-side copies signable.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}
