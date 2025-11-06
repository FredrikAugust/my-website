import type { CollectionConfig } from 'payload'
import { extractExifData } from '../utils/extractExif'

export const Photo: CollectionConfig = {
  slug: 'photo',
  labels: { singular: 'Photo', plural: 'Photos' },
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Only process on new uploads or when file changes
        if (req.file) {
          const exifData = await extractExifData(req.file.data)

          if (exifData) {
            // Auto-populate taken_at from EXIF if not manually set and EXIF has it
            if (!data.taken_at && exifData.takenAt) {
              data.taken_at = exifData.takenAt
            }

            // Populate EXIF fields
            data.exif = {
              cameraMake: exifData.cameraMake,
              cameraModel: exifData.cameraModel,
              lensMake: exifData.lensMake,
              lensModel: exifData.lensModel,
              focalLength: exifData.focalLength,
              aperture: exifData.aperture,
              shutterSpeed: exifData.shutterSpeed,
              iso: exifData.iso,
            }

            // Populate GPS data if available
            if (exifData.latitude && exifData.longitude) {
              data.gps = {
                latitude: exifData.latitude,
                longitude: exifData.longitude,
              }
            }
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
    },
    {
      name: 'taken_at',
      label: 'Taken at',
      type: 'date',
      admin: {
        description: 'Auto-populated from EXIF data if available',
      },
    },
    {
      name: 'exif',
      label: 'EXIF Data',
      type: 'group',
      admin: {
        description: 'Automatically extracted from photo',
        readOnly: true,
      },
      fields: [
        {
          name: 'cameraMake',
          label: 'Camera Make',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'cameraModel',
          label: 'Camera Model',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'lensMake',
          label: 'Lens Make',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'lensModel',
          label: 'Lens Model',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'focalLength',
          label: 'Focal Length',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'aperture',
          label: 'Aperture',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'shutterSpeed',
          label: 'Shutter Speed',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'iso',
          label: 'ISO',
          type: 'number',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'gps',
      label: 'GPS Location',
      type: 'group',
      admin: {
        description: 'Automatically extracted from photo EXIF data',
        readOnly: true,
      },
      fields: [
        {
          name: 'latitude',
          label: 'Latitude',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'longitude',
          label: 'Longitude',
          type: 'number',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'album',
      type: 'join',
      collection: 'album',
      on: 'photos',
      admin: { allowCreate: false },
      hasMany: false,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    disableLocalStorage: true,
    adminThumbnail: 'small',
    imageSizes: [
      {
        name: 'small',
        width: 480,
        height: 480,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'large',
        width: 2880,
        height: 2880,
        fit: 'inside',
        withoutEnlargement: true,
      },
    ],
  },
}
