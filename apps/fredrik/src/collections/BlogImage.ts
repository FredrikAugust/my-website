import path from 'node:path'
import type { CollectionConfig } from 'payload'
import { setImmutableMediaCache } from '../lib/r2Cache'

export const BlogImage: CollectionConfig = {
  slug: 'blog-image',
  labels: { singular: 'Blog Image', plural: 'Blog Images' },
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
  },
  hooks: { afterChange: [setImmutableMediaCache] },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    staticDir: path.resolve(process.cwd(), 'data/media'),
    filesRequiredOnCreate: process.env.PAYLOAD_MIGRATION_MODE !== 'true',
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        fit: 'cover',
      },
      {
        name: 'large',
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      },
    ],
  },
}
