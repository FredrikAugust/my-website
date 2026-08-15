import type { GlobalConfig } from 'payload'

export const PiPlayback: GlobalConfig = {
  slug: 'pi-playback',
  label: 'Pi playback',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Choose a different MP4 for each Raspberry Pi display.',
    group: 'Displays',
  },
  fields: [
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'pi1Video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'video/mp4' } },
      admin: {
        description: 'Upload an MP4 in Media first, then select it for Pi 1.',
      },
    },
    {
      name: 'pi2Video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'video/mp4' } },
      admin: {
        description: 'Upload an MP4 in Media first, then select it for Pi 2.',
      },
    },
    {
      name: 'pi3Video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'video/mp4' } },
      admin: {
        description: 'Upload an MP4 in Media first, then select it for Pi 3.',
      },
    },
  ],
}
