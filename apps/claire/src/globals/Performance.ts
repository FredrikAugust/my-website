import type { GlobalConfig } from 'payload'

export const Performance: GlobalConfig = {
  slug: 'performance-page',
  label: 'Performance Page',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Choreography and live works',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'backgroundTitle',
      type: 'text',
      defaultValue: 'My Background',
    },
    {
      name: 'backgroundContent',
      type: 'richText',
      admin: { description: 'Dance training and background bio text.' },
    },
    {
      name: 'affiliations',
      type: 'array',
      fields: [
        { name: 'organization', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'years', type: 'text' },
      ],
    },
    {
      name: 'ctaTitle',
      type: 'text',
      defaultValue: 'Commission & Collaboration',
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
    },
  ],
}
