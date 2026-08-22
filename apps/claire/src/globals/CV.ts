import type { GlobalConfig } from 'payload'

export const CV: GlobalConfig = {
  slug: 'cv',
  fields: [
    {
      name: 'fullPdf',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      admin: { description: 'Current full CV as a PDF.' },
    },
    {
      name: 'downloadFilename',
      type: 'text',
      defaultValue: 'Claire-Foody-CV.pdf',
      validate: (value: string | null | undefined) =>
        !value || /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.pdf$/.test(value)
          ? true
          : 'Use a safe filename ending in .pdf.',
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'entries',
          type: 'array',
          fields: [
            { name: 'year', type: 'number', required: true },
            {
              name: 'yearEnd',
              type: 'number',
              admin: { description: 'End year for ranges, e.g. 2025–2026' },
            },
            { name: 'title', type: 'text', required: true },
            { name: 'venue', type: 'text' },
            { name: 'location', type: 'text' },
            {
              name: 'pieces',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'sidebarSections',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'entries',
          type: 'array',
          fields: [
            { name: 'year', type: 'number', required: true },
            {
              name: 'yearEnd',
              type: 'number',
              admin: { description: 'End year for ranges, e.g. 2025–2026' },
            },
            { name: 'title', type: 'text', required: true },
            { name: 'details', type: 'text' },
            {
              name: 'pieces',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
