import type { GlobalConfig } from 'payload'

export const Works: GlobalConfig = {
  slug: 'works-page',
  label: 'Works Page',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Installations, films, and performances',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
