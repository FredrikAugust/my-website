import type { Config } from 'payload'
import { APIError } from 'payload'

import { MAX_MEDIA_BYTES, MEDIA_MIME_TYPES } from './mediaPolicy'

type UploadRequest = {
  collectionSlug?: unknown
  filename?: unknown
  filesize?: unknown
  mimeType?: unknown
}

export function validateR2UploadRequest(data: UploadRequest) {
  if (data.collectionSlug !== 'media') throw new APIError('Invalid upload collection.', 400)
  if (!MEDIA_MIME_TYPES.includes(data.mimeType as string)) {
    throw new APIError('Unsupported media type.', 400)
  }
  if (!Number.isSafeInteger(data.filesize) || Number(data.filesize) <= 0) {
    throw new APIError('A valid file size is required.', 400)
  }
  if (Number(data.filesize) > MAX_MEDIA_BYTES) {
    throw new APIError('File exceeds the 500 MiB limit.', 400)
  }
  const hasControlCharacter =
    typeof data.filename === 'string' &&
    Array.from(data.filename).some((character) => character.charCodeAt(0) <= 0x1f)

  if (
    typeof data.filename !== 'string' ||
    !data.filename.trim() ||
    data.filename.length > 255 ||
    /[\\/]/.test(data.filename) ||
    hasControlCharacter
  ) {
    throw new APIError('Invalid filename.', 400)
  }
}

export const enforceR2UploadPolicy = (config: Config): Config => {
  const endpoint = config.endpoints?.find(({ path }) => path === '/storage-s3-generate-signed-url')
  if (!endpoint) return config

  const handler = endpoint.handler
  endpoint.handler = async (req) => {
    if (!req.json) throw new APIError('Content-Type expected to be application/json', 400)
    const data = (await req.json()) as UploadRequest
    validateR2UploadRequest(data)
    req.json = async () => data
    return handler(req)
  }

  return config
}
