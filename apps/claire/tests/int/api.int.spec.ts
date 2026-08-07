import config from '@/payload.config'
import { type Payload, getPayload } from 'payload'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const expectRestoredData = process.env.PARITY_RESTORED_DATA === 'true'

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    await payload.destroy()
  })

  it('queries portfolio content, media, and the admin collection', async () => {
    const [works, media, users] = await Promise.all([
      payload.find({ collection: 'works', depth: 0, limit: 1 }),
      payload.find({ collection: 'media', depth: 0, pagination: false }),
      payload.find({ collection: 'users', depth: 0, limit: 1 }),
    ])

    expect(works.totalDocs).toBeGreaterThanOrEqual(0)
    expect(users.totalDocs).toBeGreaterThanOrEqual(0)

    if (expectRestoredData) {
      expect(works.totalDocs).toBeGreaterThan(0)
      expect(users.totalDocs).toBeGreaterThan(0)
      expect(media.docs.some((item) => item.mimeType?.startsWith('image/'))).toBe(true)
      expect(media.docs.some((item) => item.mimeType === 'application/pdf')).toBe(true)
      expect(media.docs.some((item) => item.mimeType === 'video/mp4')).toBe(true)
    }
  })

  it('loads every site global', async () => {
    const slugs = [
      'home',
      'site-settings',
      'about',
      'cv',
      'contact',
      'performance-page',
      'film-page',
      'works-page',
    ] as const

    const globals = await Promise.all(slugs.map((slug) => payload.findGlobal({ slug, depth: 0 })))
    expect(globals).toHaveLength(slugs.length)
  })
})
