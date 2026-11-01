import type { CopyObjectCommandInput, HeadObjectCommandOutput } from '@aws-sdk/client-s3'

export const MEDIA_PREFIX = 'claire-media-uploads'
export const IMMUTABLE_MEDIA_CACHE = 'public, max-age=31536000, immutable'

export const STORED_MEDIA_MISSING =
  'The file did not reach storage. The upload to R2 failed or was rejected, so this media record was not saved. Try the upload again. If it keeps failing, confirm the R2 bucket allows browser PUT uploads from this site (Content-Type, Content-Length, and If-None-Match) and that the file is 500 MiB or smaller.'

export const STORED_MEDIA_SIZE_MISMATCH =
  'The stored file size does not match the upload, so this media record was not saved.'

export const STORED_MEDIA_UNVERIFIED =
  'The upload could not be verified in storage, so this media record was not saved. Try again.'

export const STORED_MEDIA_FILENAME =
  'The upload is missing a usable filename, so this media record was not saved.'

export function isSafeMediaFilename(filename: string): boolean {
  return (
    filename.length > 0 &&
    filename.length <= 255 &&
    !filename.includes('\0') &&
    !filename.includes('/') &&
    !filename.includes('\\') &&
    filename !== '.' &&
    filename !== '..'
  )
}

export function isSafeObjectPrefix(prefix: string): boolean {
  const parts = prefix.split('/').filter((part) => part.length > 0)
  return (
    parts.length > 0 && parts.every((part) => part !== '.' && part !== '..' && !part.includes('\0'))
  )
}

function trimSlashes(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '')
}

/** Payload 3.92 stores new uploads at `<prefix>/<objectKey>/<filename>`. Older rows have no object key. */
export function mediaObjectKey(
  prefix: string | null | undefined,
  filename: string,
  objectKey?: string | null,
): string | undefined {
  if (!isSafeMediaFilename(filename)) return undefined
  const safePrefix = prefix && prefix.trim() ? trimSlashes(prefix) : MEDIA_PREFIX
  const safeObjectKey = objectKey && objectKey.trim() ? trimSlashes(objectKey) : ''
  if (safePrefix && !isSafeObjectPrefix(safePrefix)) return undefined
  if (safeObjectKey && !isSafeObjectPrefix(safeObjectKey)) return undefined
  const folder = [safePrefix, safeObjectKey].filter(Boolean).join('/') || MEDIA_PREFIX
  if (!isSafeObjectPrefix(folder)) return undefined
  return `${folder}/${filename}`
}

export function uploadObjectKey(record: unknown): string | undefined {
  if (!record || typeof record !== 'object' || !('_objectKey' in record)) return undefined
  const value = (record as { _objectKey?: unknown })._objectKey
  return typeof value === 'string' && value.trim() ? value : undefined
}

export function encodeCopySource(bucket: string, key: string): string {
  return [bucket, ...key.split('/')].map((part) => encodeURIComponent(part)).join('/')
}

export function publicObjectUrl(
  filename: string,
  prefix: string | null | undefined,
  base: string | undefined,
  objectKey?: string | null,
): string | undefined {
  const root = base?.replace(/\/$/, '')
  const key = mediaObjectKey(prefix, filename, objectKey)
  if (!root || !key) return undefined
  return `${root}/${key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

export function legacyMediaRedirectUrl(options: {
  filename: string
  prefix?: string | null
  objectKey?: string | null
  publicBase?: string
  localFileExists: boolean
  clientUpload: boolean
}): string | undefined {
  if (options.clientUpload || options.localFileExists) return undefined
  return publicObjectUrl(options.filename, options.prefix, options.publicBase, options.objectKey)
}

export function clientUploadPrefix(context: unknown): string | undefined {
  if (!context || typeof context !== 'object' || !('prefix' in context)) return undefined
  const prefix = (context as { prefix?: unknown }).prefix
  return typeof prefix === 'string' && prefix.trim() ? prefix : undefined
}

export function cacheHeaderFailureMessage(filename: string, missing: boolean): string {
  return missing
    ? `Media file "${filename}" is not in R2, so it is not usable and Cache-Control was not applied.`
    : `Media file "${filename}" is stored, but Cache-Control could not be applied.`
}

export function immutableCacheCopyInput(args: {
  bucket: string
  key: string
  head: Pick<
    HeadObjectCommandOutput,
    | 'ContentType'
    | 'ContentDisposition'
    | 'ContentEncoding'
    | 'ContentLanguage'
    | 'Expires'
    | 'Metadata'
  >
  fallbackContentType?: string | null
}): CopyObjectCommandInput | undefined {
  const contentType = args.head.ContentType || args.fallbackContentType || undefined
  if (!contentType) return undefined

  return {
    Bucket: args.bucket,
    CacheControl: IMMUTABLE_MEDIA_CACHE,
    ContentType: contentType,
    CopySource: encodeCopySource(args.bucket, args.key),
    Key: args.key,
    MetadataDirective: 'REPLACE',
    ...(args.head.ContentDisposition ? { ContentDisposition: args.head.ContentDisposition } : {}),
    ...(args.head.ContentEncoding ? { ContentEncoding: args.head.ContentEncoding } : {}),
    ...(args.head.ContentLanguage ? { ContentLanguage: args.head.ContentLanguage } : {}),
    ...(args.head.Expires ? { Expires: args.head.Expires } : {}),
    ...(args.head.Metadata ? { Metadata: args.head.Metadata } : {}),
  }
}

export function isMissingObject(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } }
  return (
    candidate.name === 'NotFound' ||
    candidate.name === 'NoSuchKey' ||
    candidate.$metadata?.httpStatusCode === 404
  )
}
