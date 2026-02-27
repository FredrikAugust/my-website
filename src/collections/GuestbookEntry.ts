import type { CollectionConfig } from 'payload'

export const GuestbookEntry: CollectionConfig = {
  slug: 'guestbook-entry',
  labels: { singular: 'Guestbook Entry', plural: 'Guestbook Entries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'message', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 1000,
    },
  ],
}
