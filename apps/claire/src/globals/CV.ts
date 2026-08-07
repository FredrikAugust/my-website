import type { GlobalConfig } from 'payload'

export const CV: GlobalConfig = {
  slug: 'cv',
  fields: [
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
