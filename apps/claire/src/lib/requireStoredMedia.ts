import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { APIError, type CollectionBeforeChangeHook } from 'payload'

import {
  STORED_MEDIA_FILENAME,
  STORED_MEDIA_MISSING,
  STORED_MEDIA_SIZE_MISMATCH,
  STORED_MEDIA_UNVERIFIED,
  clientUploadPrefix,
  isMissingObject,
  mediaObjectKey,
  uploadObjectKey,
} from './mediaStorage'
import { createR2Client, readR2Config } from './r2Client'

type UploadFile = {
  clientUploadContext?: unknown
  name?: string
  size?: number
}

export function assertStoredClientUpload(input: {
  configured: boolean
  hasClientUpload: boolean
  filename?: string
  found: boolean
  contentLength?: number
  expectedSize?: number
}): void {
  if (!input.configured || !input.hasClientUpload) return
  if (!input.filename) throw new APIError(STORED_MEDIA_FILENAME, 400)
  if (!input.found) throw new APIError(STORED_MEDIA_MISSING, 400)
  if (
    typeof input.expectedSize === 'number' &&
    typeof input.contentLength === 'number' &&
    input.contentLength !== input.expectedSize
  ) {
    throw new APIError(STORED_MEDIA_SIZE_MISMATCH, 400)
  }
}

export const requireStoredMedia: CollectionBeforeChangeHook = async ({ data, req }) => {
  const config = readR2Config()
  const file = req.file as UploadFile | undefined
  const hasClientUpload = Boolean(file?.clientUploadContext)
  if (!config || !hasClientUpload) return data

  const filename = typeof data?.filename === 'string' ? data.filename : file?.name
  const prefix =
    (typeof data?.prefix === 'string' && data.prefix) ||
    clientUploadPrefix(file?.clientUploadContext)
  const objectKey = uploadObjectKey(data) || uploadObjectKey(file?.clientUploadContext)
  const key = filename ? mediaObjectKey(prefix, filename, objectKey) : undefined
  if (!key) {
    assertStoredClientUpload({
      configured: true,
      filename: undefined,
      found: false,
      hasClientUpload,
    })
    return data
  }

  try {
    const head = await createR2Client(config).send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: key }),
    )
    assertStoredClientUpload({
      configured: true,
      contentLength: head.ContentLength,
      expectedSize: file?.size,
      filename,
      found: true,
      hasClientUpload,
    })
  } catch (error) {
    if (error instanceof APIError) throw error
    if (isMissingObject(error)) throw new APIError(STORED_MEDIA_MISSING, 400)
    req.payload.logger.error({
      err: error,
      msg: `Refusing to save media "${filename}" because the R2 object could not be verified.`,
    })
    throw new APIError(STORED_MEDIA_UNVERIFIED, 502)
  }

  return data
}
