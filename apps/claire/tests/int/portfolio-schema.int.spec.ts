import configPromise from '@/payload.config'
import type { Field } from 'payload'
import { describe, expect, it, vi } from 'vitest'

const findField = (fields: Field[], name: string) =>
  fields.find((field) => 'name' in field && field.name === name)

describe('portfolio schema', () => {
  it('uses draft-enabled project collections and published-only anonymous reads', async () => {
    const config = await configPromise
    for (const slug of ['installations', 'exhibitions', 'films']) {
      const collection = config.collections.find((item) => item.slug === slug)
      expect(collection?.versions).toHaveProperty('drafts.autosave')
      const read = collection?.access?.read
      expect(typeof read).toBe('function')
      if (typeof read === 'function') {
        expect(await read({ req: { user: null } } as never)).toEqual({
          _status: { equals: 'published' },
        })
        expect(await read({ req: { user: { id: 1 } } } as never)).toBe(true)
      }
    }
  })

  it('requires filtered project media and an ordered installation relationship', async () => {
    const config = await configPromise
    const films = config.collections.find((item) => item.slug === 'films')!
    const thumbnail = findField(films.fields, 'thumbnailImage') as {
      required?: boolean
      filterOptions?: unknown
    }
    const video = findField(films.fields, 'video') as { filterOptions?: unknown }
    expect(thumbnail.required).toBe(true)
    expect(thumbnail.filterOptions).toEqual({ mimeType: { contains: 'image/' } })
    expect(video.filterOptions).toEqual({ mimeType: { equals: 'video/mp4' } })

    const exhibitions = config.collections.find((item) => item.slug === 'exhibitions')!
    const relationship = findField(exhibitions.fields, 'includedInstallations') as {
      relationTo?: string
      hasMany?: boolean
      index?: boolean
      filterOptions?: (args: { user: unknown }) => unknown
    }
    expect(relationship).toMatchObject({ relationTo: 'installations', hasMany: true, index: true })
    expect(relationship.filterOptions?.({ user: null })).toEqual({
      _status: { equals: 'published' },
    })
  })

  it('rejects a slug already used by another project collection', async () => {
    const config = await configPromise
    const installations = config.collections.find((item) => item.slug === 'installations')!
    const hook = installations.hooks?.beforeValidate?.[0]
    expect(hook).toBeTypeOf('function')
    const find = vi.fn().mockResolvedValueOnce({ totalDocs: 1 })
    await expect(
      hook?.({
        data: { title: 'Shared Title' },
        originalDoc: null,
        req: { payload: { find } },
      } as never),
    ).rejects.toThrow('already used')
  })

  it('limits the CV upload chooser to PDFs', async () => {
    const config = await configPromise
    const cv = config.globals.find((item) => item.slug === 'cv')!
    const pdf = findField(cv.fields, 'fullPdf') as { filterOptions?: unknown }
    expect(pdf.filterOptions).toEqual({ mimeType: { equals: 'application/pdf' } })
  })
})
