import type { CollectionConfig } from 'payload'

export const Photo: CollectionConfig = {
  slug: 'photo',
  labels: { singular: 'Photo', plural: 'Photos' },
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
    {
      name: 'description',
      label: 'Description',
      type: 'text',
    },
    {
      name: 'taken_at',
      label: 'Taken at',
      type: 'date',
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
    },
    {
      name: 'album',
      type: 'join',
      collection: 'album',
      on: 'photos',
      admin: { allowCreate: false },
      hasMany: false,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    disableLocalStorage: true,
    adminThumbnail: 'small',
    imageSizes: [
      {
        name: 'small',
        width: 480,
        height: 480,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'large',
        width: 2880,
        height: 2880,
        fit: 'inside',
        withoutEnlargement: true,
      },
    ],
  },
}
