import type { UploadFieldValidation } from 'payload'

export const MAX_MEDIA_BYTES = 500 * 1024 * 1024
export const MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/pdf',
  'video/mp4',
]

export const mayUploadDirectly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const requireVideoPoster: UploadFieldValidation = (value, { siblingData }) => {
  const video = (siblingData as { video?: unknown } | undefined)?.video
  return !video || value ? true : 'Choose a poster image for the selected video.'
}
