import type { CollectionConfig } from 'payload'

export const BlogImage: CollectionConfig = {
  slug: 'blog-image',
  labels: { singular: 'Blog Image', plural: 'Blog Images' },
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
  },
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
    disableLocalStorage: true,
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
