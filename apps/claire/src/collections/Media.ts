import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { MEDIA_MIME_TYPES } from '../lib/mediaPolicy'
import { setImmutableMediaCache } from '../lib/r2Cache'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: { afterChange: [setImmutableMediaCache] },
  defaultPopulate: {
    url: true,
    alt: true,
    width: true,
    height: true,
    mimeType: true,
    filename: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    filesRequiredOnCreate: process.env.PAYLOAD_MIGRATION_MODE !== 'true',
    mimeTypes: MEDIA_MIME_TYPES,
    staticDir: path.resolve(process.cwd(), 'data/media'),
  },
}
