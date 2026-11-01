import { existsSync } from 'node:fs'
import path from 'node:path'
import type { CollectionAfterReadHook } from 'payload'

import { publicObjectUrl, uploadObjectKey } from './mediaStorage'

export const usePublicMediaWhenLocalFileIsMissing: CollectionAfterReadHook = ({ doc }) => {
  const fallback = process.env.LOCAL_MEDIA_FALLBACK_URL?.replace(/\/$/, '')
  if (!fallback || !doc.filename) return doc

  const localFile = path.resolve(process.cwd(), 'data/media', doc.filename)
  if (existsSync(localFile)) return doc

  const url = publicObjectUrl(
    doc.filename,
    typeof doc.prefix === 'string' ? doc.prefix : undefined,
    fallback,
    uploadObjectKey(doc),
  )
  if (url) doc.url = url
  return doc
}
