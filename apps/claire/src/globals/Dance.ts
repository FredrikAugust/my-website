import type { GlobalConfig } from 'payload'

import { creditsField, playbackFields } from '../fields/projectFields'

const stageWorkFields = [
  { name: 'title', type: 'text' as const, required: true },
  { name: 'anchor', type: 'text' as const, required: true },
  { name: 'companyOrVenue', type: 'text' as const },
  { name: 'role', type: 'text' as const },
  { name: 'dateOrYear', type: 'text' as const },
  {
    name: 'image',
    type: 'upload' as const,
    relationTo: 'media' as const,
    filterOptions: { mimeType: { contains: 'image/' } },
  },
  { name: 'description', type: 'richText' as const },
  ...playbackFields(),
  creditsField(),
]

export const Dance: GlobalConfig = {
  slug: 'dance',
  label: 'Dance',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Dance' },
    { name: 'introduction', type: 'richText' },
    { name: 'showreel', type: 'group', fields: playbackFields() },
    {
      name: 'performanceFootage',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'year', type: 'number' },
        { name: 'description', type: 'richText' },
        ...playbackFields(),
        creditsField(),
      ],
    },
    { name: 'selectedStageWorks', type: 'array', fields: stageWorkFields },
  ],
}
