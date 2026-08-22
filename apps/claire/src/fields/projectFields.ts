import type { Field } from 'payload'
import { slugField } from 'payload'

import { requireVideoPoster } from '../lib/mediaPolicy'

export const projectSlugField = () =>
  slugField({
    useAsSlug: 'title',
    position: 'sidebar',
    overrides: (field) => ({
      ...field,
      admin: { ...field.admin, description: 'Used in the public project URL.' },
    }),
  })

export const publishingFields = (): Field[] => [
  {
    name: 'featured',
    type: 'checkbox',
    defaultValue: false,
    admin: { position: 'sidebar', description: 'Available for homepage curation.' },
  },
  {
    name: 'sortOrder',
    type: 'number',
    defaultValue: 0,
    index: true,
    admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
  },
]

export const cardMediaFields = ({ thumbnailRequired = false } = {}): Field[] => [
  {
    name: 'heroImage',
    type: 'upload',
    relationTo: 'media',
    required: true,
    filterOptions: { mimeType: { contains: 'image/' } },
    admin: { description: 'Leading image. At least 2400 px wide is recommended.' },
  },
  {
    name: 'thumbnailImage',
    type: 'upload',
    relationTo: 'media',
    required: thumbnailRequired,
    filterOptions: { mimeType: { contains: 'image/' } },
    admin: { description: 'Card image. At least 1600 px wide is recommended.' },
  },
]

export const galleryField = (name = 'gallery'): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Gallery image', plural: 'Gallery images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'image/' } },
    },
    { name: 'caption', type: 'text' },
  ],
})

export const creditsField = (name = 'credits'): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Credit', plural: 'Credits and collaborators' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
  ],
})

export const playbackFields = (): Field[] => [
  {
    name: 'video',
    type: 'upload',
    relationTo: 'media',
    filterOptions: { mimeType: { equals: 'video/mp4' } },
    admin: { description: 'Uploaded MP4. Takes precedence over Vimeo.' },
  },
  {
    name: 'videoPoster',
    type: 'upload',
    relationTo: 'media',
    filterOptions: { mimeType: { contains: 'image/' } },
    validate: requireVideoPoster,
    admin: { description: 'Required poster when an uploaded video is selected.' },
  },
  {
    name: 'vimeoUrl',
    type: 'text',
    admin: { description: 'Vimeo URL used when no uploaded video is selected.' },
  },
]

export const screeningField = (): Field => ({
  name: 'screenings',
  type: 'array',
  fields: [
    { name: 'festival', type: 'text', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
  ],
})
