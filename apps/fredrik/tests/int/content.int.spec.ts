import config from '../../src/payload.config'
import { type Payload, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const expectRestoredData = process.env.PARITY_RESTORED_DATA === 'true'

describe('Fredrik production data contract', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    await payload.destroy()
  })

  it('queries public content, media, guestbook entries, and the admin collection', async () => {
    const [posts, images, entries, users] = await Promise.all([
      payload.find({ collection: 'blog', depth: 0, limit: 1 }),
      payload.find({ collection: 'blog-image', depth: 0, limit: 1 }),
      payload.find({ collection: 'guestbook-entry', depth: 0, limit: 1 }),
      payload.find({ collection: 'users', depth: 0, limit: 1 }),
    ])

    for (const result of [posts, images, entries, users]) {
      expect(result.totalDocs).toBeGreaterThanOrEqual(0)
    }

    if (expectRestoredData) {
      expect(posts.totalDocs).toBeGreaterThan(0)
      expect(images.totalDocs).toBeGreaterThan(0)
      expect(entries.totalDocs).toBeGreaterThan(0)
      expect(users.totalDocs).toBeGreaterThan(0)
    }
  })

  it('round-trips a guestbook write on a disposable restore', async () => {
    const created = await payload.create({
      collection: 'guestbook-entry',
      data: {
        name: 'Parity check',
        message: 'Disposable migration verification',
      },
      overrideAccess: true,
    })

    const readBack = await payload.findByID({
      collection: 'guestbook-entry',
      id: created.id,
      overrideAccess: true,
    })
    expect(readBack.message).toBe('Disposable migration verification')

    await payload.delete({
      collection: 'guestbook-entry',
      id: created.id,
      overrideAccess: true,
    })
  })
})
