import type { GlobalConfig } from 'payload'

export const Film: GlobalConfig = {
  slug: 'film-page',
  label: 'Film Page',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Moving image and choreography',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'ctaTitle',
      type: 'text',
      defaultValue: 'Screening Inquiries',
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
    },
  ],
}
