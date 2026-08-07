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
