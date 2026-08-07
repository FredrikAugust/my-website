import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  fields: [
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'headline',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'approach',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' },
      ],
    },
  ],
}
