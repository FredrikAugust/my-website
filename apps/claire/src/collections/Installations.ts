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

export const Installations: CollectionConfig = {
  slug: 'installations',
  labels: { singular: 'Installation', plural: 'Installations' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', '_status', 'sortOrder'],
  },
  access: { read: publishedOrAuthenticated },
  defaultPopulate: {
    title: true,
    slug: true,
    year: true,
    heroImage: true,
    thumbnailImage: true,
    shortDescription: true,
    _status: true,
  },
  hooks: { beforeValidate: [validateProjectSlugUniqueness('installations')] },
  versions: { drafts: { autosave: true }, maxPerDoc: 20 },
  fields: [
    { name: 'title', type: 'text', required: true },
    projectSlugField(),
    ...publishingFields(),
    { name: 'year', type: 'number', required: true },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'description', type: 'richText' },
    ...cardMediaFields(),
    ...playbackFields(),
    galleryField(),
    { name: 'materials', type: 'textarea', required: true },
    { name: 'dimensions', type: 'text', required: true },
    creditsField(),
  ],
}
