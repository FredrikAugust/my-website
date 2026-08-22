import type { GlobalConfig } from 'payload'
import { requireVideoPoster } from '../lib/mediaPolicy'

export const Home: GlobalConfig = {
  slug: 'home',
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { equals: 'video/mp4' } },
          admin: {
            description: 'MP4 video for hero background.',
          },
        },
        {
          name: 'fallbackImage',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { contains: 'image/' } },
          validate: requireVideoPoster,
          admin: {
            description: 'Poster/fallback image when video is unavailable.',
          },
        },
        { name: 'title', type: 'text' },
        { name: 'descriptor', type: 'text' },
      ],
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: ['installations', 'exhibitions', 'films'],
      hasMany: true,
      maxRows: 3,
      admin: {
        description: 'Choose up to 3 published projects in homepage order.',
      },
      filterOptions: { _status: { equals: 'published' } },
    },
    {
      name: 'aboutPractice',
      type: 'group',
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          admin: {
            description: 'Blockquote text for homepage about section.',
          },
        },
        {
          name: 'body',
          type: 'richText',
        },
      ],
    },
  ],
}
