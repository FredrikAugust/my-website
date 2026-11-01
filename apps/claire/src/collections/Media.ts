import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { redirectLegacyMediaFile } from '../lib/legacyMediaFile'
import { usePublicMediaWhenLocalFileIsMissing } from '../lib/localMediaFallback'
import { MEDIA_MIME_TYPES } from '../lib/mediaPolicy'
import { requireStoredMedia } from '../lib/requireStoredMedia'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [requireStoredMedia],
    afterRead: [usePublicMediaWhenLocalFileIsMissing],
  },
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
    handlers: [redirectLegacyMediaFile],
    mimeTypes: MEDIA_MIME_TYPES,
    staticDir: path.resolve(process.cwd(), 'data/media'),
  },
}
