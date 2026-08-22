import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '../access/published'
import {
  cardMediaFields,
  creditsField,
  galleryField,
  playbackFields,
  projectSlugField,
  publishingFields,
} from '../fields/projectFields'
import { validateProjectSlugUniqueness } from '../lib/projectSlug'

export const Exhibitions: CollectionConfig = {
  slug: 'exhibitions',
  labels: { singular: 'Exhibition', plural: 'Exhibitions' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'venue', 'city', '_status', 'sortOrder'],
  },
  access: { read: publishedOrAuthenticated },
  defaultPopulate: {
    title: true,
    slug: true,
    heroImage: true,
    thumbnailImage: true,
    overview: true,
    venue: true,
    city: true,
    dateLabel: true,
    _status: true,
  },
  hooks: { beforeValidate: [validateProjectSlugUniqueness('exhibitions')] },
  versions: { drafts: { autosave: true }, maxPerDoc: 20 },
  fields: [
    { name: 'title', type: 'text', required: true },
    projectSlugField(),
    ...publishingFields(),
    { name: 'overview', type: 'richText', required: true },
    { name: 'venue', type: 'text', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    {
      name: 'dateLabel',
      type: 'text',
      admin: { description: 'Display label when exact dates are unavailable, e.g. “Spring 2026”.' },
    },
    ...cardMediaFields(),
    ...playbackFields(),
    galleryField('documentation'),
    creditsField(),
    {
      name: 'includedInstallations',
      type: 'relationship',
      relationTo: 'installations',
      hasMany: true,
      index: true,
      admin: { description: 'Ordered list of works in this exhibition.' },
      filterOptions: ({ user }) => (user ? true : { _status: { equals: 'published' } }),
    },
  ],
}
