import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { CollectionAfterChangeHook } from 'payload'

export const IMMUTABLE_MEDIA_CACHE = 'public, max-age=31536000, immutable'

export const setImmutableMediaCache: CollectionAfterChangeHook = async ({ doc, req }) => {
  const { S3_ACCESS_KEY_ID, S3_BUCKET, S3_ENDPOINT, S3_SECRET_ACCESS_KEY } = process.env
  if (
    !req.file ||
    !doc.filename ||
    !S3_BUCKET ||
    !S3_ENDPOINT ||
    !S3_ACCESS_KEY_ID ||
    !S3_SECRET_ACCESS_KEY
  ) {
    return doc
  }

  const key = [doc.prefix || 'claire-media-uploads', doc.filename].map(encodeURIComponent).join('/')
  const client = new S3Client({
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
    region: process.env.S3_REGION || 'auto',
  })

  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: S3_BUCKET,
        CacheControl: IMMUTABLE_MEDIA_CACHE,
        CopySource: `${S3_BUCKET}/${key}`,
        Key: `${doc.prefix || 'claire-media-uploads'}/${doc.filename}`,
        MetadataDirective: 'COPY',
      }),
    )
  } catch (error) {
    req.payload.logger.warn({
      err: error,
      msg: 'Uploaded media is usable, but immutable caching could not be applied.',
    })
  }
  return doc
}
