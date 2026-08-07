import { describe, expect, it } from 'vitest'
import {
  MAX_MEDIA_BYTES,
  MEDIA_MIME_TYPES,
  mayUploadDirectly,
  requireVideoPoster,
} from '@/lib/mediaPolicy'
import { selectWorkPlayback } from '@/lib/workPlayback'
import { validateR2UploadRequest } from '@/lib/r2UploadPolicy'
import type { Media, Work } from '@/payload-types'

describe('media policy', () => {
  it('allows only the existing formats plus MP4 and caps files at 500 MiB', () => {
    expect(MEDIA_MIME_TYPES).toEqual([
      'image/jpeg',
      'image/png',
      'image/heic',
      'application/pdf',
      'video/mp4',
    ])
    expect(MAX_MEDIA_BYTES).toBe(500 * 1024 * 1024)
  })

  it('denies anonymous direct uploads', () => {
    expect(mayUploadDirectly({ req: {} })).toBe(false)
    expect(mayUploadDirectly({ req: { user: { id: 1 } } })).toBe(true)
  })

  it('validates signed upload metadata before issuing a URL', () => {
    const valid = {
      collectionSlug: 'media',
      filename: 'portfolio.mp4',
      filesize: 1024,
      mimeType: 'video/mp4',
    }

    expect(() => validateR2UploadRequest(valid)).not.toThrow()
    expect(() => validateR2UploadRequest({ ...valid, mimeType: 'application/zip' })).toThrow(
      /media type/,
    )
    expect(() => validateR2UploadRequest({ ...valid, filesize: undefined })).toThrow(/file size/)
    expect(() => validateR2UploadRequest({ ...valid, filesize: 500 * 1024 * 1024 + 1 })).toThrow(
      /500 MiB/,
    )
    expect(() => validateR2UploadRequest({ ...valid, filename: '../video.mp4' })).toThrow(
      /filename/,
    )
  })

  it('requires a poster when a video is selected', async () => {
    expect(await requireVideoPoster(null, { siblingData: { video: 1 } } as never)).toMatch(
      /poster image/,
    )
    expect(await requireVideoPoster(2, { siblingData: { video: 1 } } as never)).toBe(true)
  })

  it('prefers an uploaded video and falls back to Vimeo', () => {
    const video = { id: 1, url: 'https://media.example/video.mp4' } as Media
    const poster = { id: 2, url: 'https://media.example/poster.jpg' } as Media
    const uploaded = selectWorkPlayback({
      video,
      videoPoster: poster,
      vimeoUrl: 'https://vimeo.com/123',
    } as Work)
    expect(uploaded?.type).toBe('upload')

    const fallback = selectWorkPlayback({ vimeoUrl: 'https://vimeo.com/123' } as Work)
    expect(fallback).toEqual({ type: 'vimeo', url: 'https://vimeo.com/123' })
  })
})
