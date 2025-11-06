import type { CollectionConfig } from 'payload'

export const Album: CollectionConfig = {
  slug: 'album',
  labels: { singular: 'Album', plural: 'Albums' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'photos',
      type: 'relationship',
      relationTo: 'photo',
      hasMany: true, // allows multiple selections
      admin: {
        description: 'Select photos to include in this album',
      },
    },
  ],
}
