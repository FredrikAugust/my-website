import type { CollectionConfig } from 'payload'
import { requireVideoPoster } from '../lib/mediaPolicy'

export const Work: CollectionConfig = {
  slug: 'works',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'year', 'featured'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from title if left empty.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Installation', value: 'installation' },
        { label: 'Film', value: 'film' },
        { label: 'Performance', value: 'performance' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show on homepage featured grid.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description: 'Lower numbers appear first.',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'medium',
      type: 'text',
      admin: {
        description: 'e.g. "Installation / Film / Performance"',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'For film/performance, e.g. "12\'30\\""',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'venueLocation',
      type: 'text',
      admin: {
        description: 'e.g. "Basel, Switzerland"',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image, 16:9 recommended.',
      },
    },
    {
      name: 'thumbnailImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Card thumbnail, 4:3 recommended.',
      },
    },
    {
      name: 'vimeoUrl',
      type: 'text',
      admin: {
        description: 'Fallback Vimeo embed URL, used only when no uploaded video is selected.',
      },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'video/mp4' } },
      admin: {
        description: 'Optional MP4. When present, this takes precedence over Vimeo.',
      },
    },
    {
      name: 'videoPoster',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image/' } },
      validate: requireVideoPoster,
      admin: {
        description: 'Required poster/fallback image when an uploaded video is selected.',
      },
    },
    {
      name: 'collaborators',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
      ],
    },
    {
      name: 'performers',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    {
      name: 'screenings',
      type: 'array',
      fields: [
        { name: 'festival', type: 'text', required: true },
        { name: 'location', type: 'text', required: true },
        { name: 'year', type: 'number', required: true },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'files',
      type: 'array',
      admin: {
        description: 'Downloadable resources.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
