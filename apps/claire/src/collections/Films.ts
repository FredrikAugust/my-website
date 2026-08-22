import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '../access/published'
import {
  cardMediaFields,
  creditsField,
  galleryField,
  playbackFields,
  projectSlugField,
  publishingFields,
  screeningField,
} from '../fields/projectFields'
import { validateProjectSlugUniqueness } from '../lib/projectSlug'

export const Films: CollectionConfig = {
  slug: 'films',
  labels: { singular: 'Film', plural: 'Films' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'year', '_status', 'sortOrder'] },
  access: { read: publishedOrAuthenticated },
  defaultPopulate: {
    title: true,
    slug: true,
    year: true,
    thumbnailImage: true,
    heroImage: true,
    description: true,
    _status: true,
  },
  hooks: { beforeValidate: [validateProjectSlugUniqueness('films')] },
  versions: { drafts: { autosave: true }, maxPerDoc: 20 },
  fields: [
    { name: 'title', type: 'text', required: true },
    projectSlugField(),
    ...publishingFields(),
    { name: 'year', type: 'number', required: true },
    { name: 'description', type: 'richText', required: true },
    ...cardMediaFields({ thumbnailRequired: true }),
    ...playbackFields(),
    { name: 'duration', type: 'text' },
    creditsField(),
    screeningField(),
    galleryField('stills'),
  ],
}
