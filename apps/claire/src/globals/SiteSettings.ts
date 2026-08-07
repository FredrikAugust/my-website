import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    {
      name: 'artistName',
      type: 'text',
      required: true,
      defaultValue: 'Claire Foody',
    },
    {
      name: 'artistDescriptor',
      type: 'text',
      admin: {
        description: 'Short descriptor, e.g. "Canadian artist based in Europe"',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'vimeoUrl',
      type: 'text',
    },
    {
      name: 'instagramUrl',
      type: 'text',
    },
    {
      name: 'footerBio',
      type: 'textarea',
    },
  ],
}
