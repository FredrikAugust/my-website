import { CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { XMLParser } from 'fast-xml-parser'
import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { redirectLegacyMediaFile } from '@/lib/legacyMediaFile'
import {
  IMMUTABLE_MEDIA_CACHE,
  MEDIA_PREFIX,
  STORED_MEDIA_FILENAME,
  STORED_MEDIA_MISSING,
  STORED_MEDIA_SIZE_MISMATCH,
  cacheHeaderFailureMessage,
  encodeCopySource,
  immutableCacheCopyInput,
  isMissingObject,
  legacyMediaRedirectUrl,
  mediaObjectKey,
  publicObjectUrl,
} from '@/lib/mediaStorage'
import { assertStoredClientUpload } from '@/lib/requireStoredMedia'

describe('stored media guard', () => {
  it('rejects a client upload whose object is missing and accepts a matching one', () => {
    expect(() =>
      assertStoredClientUpload({
        configured: true,
        found: false,
        hasClientUpload: true,
        filename: 'deck.pdf',
      }),
    ).toThrow(STORED_MEDIA_MISSING)

    expect(() =>
      assertStoredClientUpload({
        configured: true,
        contentLength: 1024,
        expectedSize: 1024,
        filename: 'deck.pdf',
        found: true,
        hasClientUpload: true,
      }),
    ).not.toThrow()
  })

  it('does not block local or server uploads when R2 is not involved', () => {
    expect(() =>
      assertStoredClientUpload({
        configured: false,
        found: false,
        hasClientUpload: true,
      }),
    ).not.toThrow()
    expect(() =>
      assertStoredClientUpload({
        configured: true,
        found: false,
        hasClientUpload: false,
      }),
    ).not.toThrow()
  })

  it('rejects a size mismatch and a missing filename', () => {
    expect(() =>
      assertStoredClientUpload({
        configured: true,
        contentLength: 10,
        expectedSize: 12,
        filename: 'clip.mp4',
        found: true,
        hasClientUpload: true,
      }),
    ).toThrow(STORED_MEDIA_SIZE_MISMATCH)
    expect(() =>
      assertStoredClientUpload({
        configured: true,
        found: true,
        hasClientUpload: true,
      }),
    ).toThrow(STORED_MEDIA_FILENAME)
  })

  it('surfaces Payload errors the admin can show', () => {
    try {
      assertStoredClientUpload({
        configured: true,
        found: false,
        filename: 'missing.png',
        hasClientUpload: true,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(400)
    }
  })
})

describe('immutable cache copy', () => {
  it('replaces metadata while preserving content type and user metadata', () => {
    const input = immutableCacheCopyInput({
      bucket: 'claire-website-media',
      fallbackContentType: 'application/octet-stream',
      head: {
        ContentDisposition: 'inline',
        ContentType: 'application/pdf',
        Metadata: { origin: 'admin' },
      },
      key: 'claire-media-uploads/pitch deck.pdf',
    })

    expect(input).toMatchObject({
      Bucket: 'claire-website-media',
      CacheControl: IMMUTABLE_MEDIA_CACHE,
      ContentDisposition: 'inline',
      ContentType: 'application/pdf',
      CopySource: 'claire-website-media/claire-media-uploads/pitch%20deck.pdf',
      Key: 'claire-media-uploads/pitch deck.pdf',
      Metadata: { origin: 'admin' },
      MetadataDirective: 'REPLACE',
    })
    expect(input).toBeDefined()
    expect(new CopyObjectCommand(input!).input.MetadataDirective).toBe('REPLACE')
  })

  it('does not invent a content type when storage did not record one', () => {
    expect(
      immutableCacheCopyInput({
        bucket: 'claire-website-media',
        head: {},
        key: 'claire-media-uploads/file.pdf',
      }),
    ).toBeUndefined()
  })

  it('describes a missing object differently from a cache-header failure', () => {
    expect(cacheHeaderFailureMessage('clip.mp4', true)).toMatch(/not usable/)
    expect(cacheHeaderFailureMessage('clip.mp4', true)).not.toMatch(/usable, but/)
    expect(cacheHeaderFailureMessage('clip.mp4', false)).toMatch(/is stored, but Cache-Control/)
    expect(isMissingObject({ name: 'NotFound', $metadata: { httpStatusCode: 404 } })).toBe(true)
    expect(isMissingObject(new Error('parse'))).toBe(false)
  })
})

describe('legacy media URLs', () => {
  it('builds the public R2 URL and leaves admin client-upload fetches alone', () => {
    expect(mediaObjectKey(undefined, '../secret')).toBeUndefined()
    expect(mediaObjectKey(MEDIA_PREFIX, 'clip.mp4', '11111111-1111-1111-1111-111111111111')).toBe(
      `${MEDIA_PREFIX}/11111111-1111-1111-1111-111111111111/clip.mp4`,
    )
    expect(encodeCopySource('bucket', `${MEDIA_PREFIX}/a b.pdf`)).toBe(
      `bucket/${MEDIA_PREFIX}/a%20b.pdf`,
    )
    expect(publicObjectUrl('pitch deck.pdf', MEDIA_PREFIX, 'https://media.clairefoody.com/')).toBe(
      `https://media.clairefoody.com/${MEDIA_PREFIX}/pitch%20deck.pdf`,
    )

    expect(
      legacyMediaRedirectUrl({
        clientUpload: false,
        filename: 'pitch-deck.pdf',
        localFileExists: false,
        publicBase: 'https://media.clairefoody.com',
      }),
    ).toBe(`https://media.clairefoody.com/${MEDIA_PREFIX}/pitch-deck.pdf`)
    expect(
      legacyMediaRedirectUrl({
        clientUpload: false,
        filename: 'clip.mp4',
        localFileExists: false,
        objectKey: '11111111-1111-1111-1111-111111111111',
        publicBase: 'https://media.clairefoody.com',
      }),
    ).toBe(
      `https://media.clairefoody.com/${MEDIA_PREFIX}/11111111-1111-1111-1111-111111111111/clip.mp4`,
    )

    expect(
      legacyMediaRedirectUrl({
        clientUpload: true,
        filename: 'pitch-deck.pdf',
        localFileExists: false,
        publicBase: 'https://media.clairefoody.com',
      }),
    ).toBeUndefined()
    expect(
      legacyMediaRedirectUrl({
        clientUpload: false,
        filename: 'pitch-deck.pdf',
        localFileExists: true,
        publicBase: 'https://media.clairefoody.com',
      }),
    ).toBeUndefined()
  })

  it('redirects a public file read and does not redirect an in-flight admin upload', async () => {
    const previous = process.env.S3_PUBLIC_URL
    process.env.S3_PUBLIC_URL = 'https://media.clairefoody.com'
    try {
      const redirect = await redirectLegacyMediaFile({} as never, {
        doc: { id: 1, prefix: MEDIA_PREFIX } as never,
        params: { collection: 'media', filename: 'pitch-deck.pdf' },
      })
      expect(redirect?.status).toBe(307)
      expect(redirect?.headers.get('location')).toBe(
        `https://media.clairefoody.com/${MEDIA_PREFIX}/pitch-deck.pdf`,
      )

      const adminFetch = await redirectLegacyMediaFile({} as never, {
        doc: null as never,
        params: {
          clientUploadContext: { prefix: MEDIA_PREFIX },
          collection: 'media',
          filename: 'pitch-deck.pdf',
        },
      })
      expect(adminFetch).toBeUndefined()
    } finally {
      if (previous === undefined) delete process.env.S3_PUBLIC_URL
      else process.env.S3_PUBLIC_URL = previous
    }
  })
})

describe('S3 error XML', () => {
  it('parses numeric character references that used to mask R2 errors', () => {
    const parser = new XMLParser({
      htmlEntities: true,
      ignoreAttributes: false,
      processEntities: { enabled: true, maxTotalExpansions: Infinity },
    })
    expect(() => {
      parser.addEntity('#xD', '\r')
      parser.addEntity('#10', '\n')
    }).not.toThrow()

    const parsed = parser.parse(
      '<?xml version="1.0" encoding="UTF-8"?><Error><Code>NoSuchKey</Code><Message>The specified key does not exist.&#xD;</Message></Error>',
    ) as { Error: { Code: string; Message: string } }

    expect(parsed.Error.Code).toBe('NoSuchKey')
    expect(parsed.Error.Message).toContain('does not exist')
  })
})

describe('head command', () => {
  it('addresses the object key the browser uploaded', () => {
    const key = mediaObjectKey(MEDIA_PREFIX, 'clip.mp4', 'abc')
    expect(key).toBe(`${MEDIA_PREFIX}/abc/clip.mp4`)
    expect(new HeadObjectCommand({ Bucket: 'claire-website-media', Key: key }).input.Key).toBe(
      `${MEDIA_PREFIX}/abc/clip.mp4`,
    )
  })
})
