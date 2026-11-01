import { existsSync } from 'node:fs'
import path from 'node:path'
import type { TypeWithID, UploadConfig } from 'payload'

import { legacyMediaRedirectUrl, uploadObjectKey } from './mediaStorage'

const STATIC_DIR = path.resolve(process.cwd(), 'data/media')

type MediaFileHandler = NonNullable<UploadConfig['handlers']>[number]

function storedPrefix(doc: TypeWithID | null): string | undefined {
  if (!doc || !('prefix' in doc)) return undefined
  const prefix = doc.prefix
  return typeof prefix === 'string' && prefix.trim() ? prefix : undefined
}

function localFileExists(filename: string): boolean {
  const localFile = path.resolve(STATIC_DIR, filename)
  return localFile.startsWith(`${STATIC_DIR}${path.sep}`) && existsSync(localFile)
}

/**
 * Old /api/media/file/:filename links still hit Payload's local disk handler, which
 * 500s once the bytes live only in R2. Redirect those public reads to the public
 * object URL. Client-upload fetches carry clientUploadContext and must keep going
 * to the S3 handler so the admin can read the object it just uploaded.
 */
export const redirectLegacyMediaFile: MediaFileHandler = (_req, args) => {
  const clientUpload =
    'clientUploadContext' in args.params && args.params.clientUploadContext != null
  const destination = legacyMediaRedirectUrl({
    clientUpload,
    filename: args.params.filename,
    localFileExists: localFileExists(args.params.filename),
    objectKey: uploadObjectKey(args.doc),
    prefix: storedPrefix(args.doc),
    publicBase: process.env.S3_PUBLIC_URL,
  })
  if (!destination) return
  return Response.redirect(destination, 307)
}
