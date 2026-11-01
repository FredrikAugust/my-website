import { CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import type { CollectionAfterChangeHook, Config } from 'payload'

import {
  MEDIA_PREFIX,
  cacheHeaderFailureMessage,
  immutableCacheCopyInput,
  isMissingObject,
  mediaObjectKey,
  uploadObjectKey,
} from './mediaStorage'
import { createR2Client, readR2Config } from './r2Client'

type SizedFile = { filename?: string | null; mimeType?: string | null }

function filesToCache(doc: {
  filename?: string | null
  mimeType?: string | null
  sizes?: Record<string, SizedFile | null> | null
}): Array<{ filename: string; mimeType?: string | null }> {
  const files: Array<{ filename: string; mimeType?: string | null }> = []
  if (doc.filename) files.push({ filename: doc.filename, mimeType: doc.mimeType })
  if (doc.sizes && typeof doc.sizes === 'object') {
    for (const size of Object.values(doc.sizes)) {
      if (size?.filename && size.filename !== doc.filename) {
        files.push({ filename: size.filename, mimeType: size.mimeType })
      }
    }
  }
  return files
}

export const setImmutableMediaCache: CollectionAfterChangeHook = async ({ doc, req }) => {
  const config = readR2Config()
  if (!req.file || !doc.filename || !config) return doc

  const client = createR2Client(config)
  const prefix = typeof doc.prefix === 'string' ? doc.prefix : MEDIA_PREFIX
  const objectKey = uploadObjectKey(doc)

  for (const file of filesToCache(doc)) {
    const key = mediaObjectKey(prefix, file.filename, objectKey)
    if (!key) continue

    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }))
      const input = immutableCacheCopyInput({
        bucket: config.bucket,
        fallbackContentType: file.mimeType,
        head,
        key,
      })
      if (!input) {
        req.payload.logger.error({
          msg: `Media file "${file.filename}" is stored, but Cache-Control was not applied because its Content-Type is missing.`,
        })
        continue
      }
      await client.send(new CopyObjectCommand(input))
    } catch (error) {
      const missing = isMissingObject(error)
      const payload = { err: error, msg: cacheHeaderFailureMessage(file.filename, missing) }
      if (missing) req.payload.logger.error(payload)
      else req.payload.logger.warn(payload)
    }
  }

  return doc
}

/** Runs after the S3 adapter's own afterChange, so server uploads already exist in R2. */
export const applyImmutableMediaCache = (config: Config): Config => ({
  ...config,
  collections: (config.collections || []).map((collection) => {
    if (collection.slug !== 'media') return collection
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [...(collection.hooks?.afterChange || []), setImmutableMediaCache],
      },
    }
  }),
})
