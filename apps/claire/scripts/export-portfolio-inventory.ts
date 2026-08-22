import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

const [outputArg, envFileArg] = process.argv.slice(2)

if (!outputArg) {
  throw new Error('Usage: payload run scripts/export-portfolio-inventory.ts <output>')
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
loadEnv({
  path: envFileArg ? path.resolve(envFileArg) : path.resolve(scriptDirectory, '../.env.local'),
  quiet: true,
  override: true,
})

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

try {
  const [works, home, siteSettings, about, cv, contact, performance, filmPage, worksPage] =
    await Promise.all([
      payload.find({
        collection: 'works',
        depth: 1,
        overrideAccess: true,
        pagination: false,
        sort: 'sortOrder',
      }),
      payload.findGlobal({ slug: 'home', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'about', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'cv', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'contact', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'performance-page', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'film-page', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'works-page', depth: 0, overrideAccess: true }),
    ])

  const inventory = {
    generatedAt: new Date().toISOString(),
    source: 'read-only Payload query',
    publicBaseUrl: 'https://clairefoody.com',
    works: works.docs.map((work) => ({
      ...work,
      publicUrl: `/works/${work.slug}`,
    })),
    globals: {
      home,
      siteSettings: {
        ...siteSettings,
        email: siteSettings.email ? '[configured]' : null,
        phone: siteSettings.phone ? '[configured]' : null,
      },
      about,
      cv,
      contact,
      performance,
      filmPage,
      worksPage,
    },
  }

  const output = path.resolve(outputArg)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 })
  console.log(`Wrote ${works.totalDocs} works to ${output}`)
} finally {
  await payload.destroy()
}
