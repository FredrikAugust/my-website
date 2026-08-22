import { existsSync } from 'node:fs'
import path from 'node:path'
import type { CollectionAfterReadHook } from 'payload'

export const usePublicMediaWhenLocalFileIsMissing: CollectionAfterReadHook = ({ doc }) => {
  const fallback = process.env.LOCAL_MEDIA_FALLBACK_URL?.replace(/\/$/, '')
  if (!fallback || !doc.filename) return doc

  const localFile = path.resolve(process.cwd(), 'data/media', doc.filename)
  if (existsSync(localFile)) return doc

  const key = [doc.prefix || 'claire-media-uploads', doc.filename]
    .map((part) => encodeURIComponent(String(part)))
    .join('/')
  doc.url = `${fallback}/${key}`
  return doc
}
