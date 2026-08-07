import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload, type Config } from 'payload'

type Site = 'claire' | 'fredrik'
type JsonObject = Record<string, unknown>

const [siteArg, canonicalArg, credentialsArg] = process.argv.slice(2)
if ((siteArg !== 'fredrik' && siteArg !== 'claire') || !canonicalArg || !credentialsArg) {
  throw new Error('Usage: create-admin.ts <fredrik|claire> <canonical-export> <credentials-output>')
}

const site = siteArg as Site
const main = async () => {
  const canonical = JSON.parse(await readFile(path.resolve(canonicalArg), 'utf8')) as {
    entities: {
      authIdentities: { users: JsonObject[] }
      collections: { blog?: JsonObject[] }
    }
  }
  const identity = canonical.entities.authIdentities.users[0]
  if (!identity?.email) throw new Error(`Missing ${site} administrator identity`)

  let password = randomBytes(24).toString('base64url')
  let writeCredentials = true
  try {
    const existing = JSON.parse(await readFile(path.resolve(credentialsArg), 'utf8')) as {
      email: string
      password: string
      site: Site
    }
    if (existing.email !== identity.email || existing.site !== site) {
      throw new Error(`Existing credentials do not match ${site}`)
    }
    password = existing.password
    writeCredentials = false
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) throw error
  }
  const configPath = path.resolve(process.cwd(), 'apps', site, 'src/payload.config.ts')
  const configModule = (await import(configPath)) as { default: Promise<Config> }
  const payload = await getPayload({ config: configModule.default })

  try {
    const user = await payload.create({
      collection: 'users',
      data: { email: String(identity.email), id: identity.id, password },
      overrideAccess: true,
    })
    const login = await payload.login({
      collection: 'users',
      data: { email: String(identity.email), password },
    })
    if (!login.token || login.user.id !== user.id) throw new Error(`${site} administrator login failed`)

    if (site === 'fredrik') {
      const verificationContent = canonical.entities.collections.blog?.[0]?.content
      if (!verificationContent) throw new Error('Missing content for Fredrik edit verification')
      const draft = await payload.create({
        collection: 'blog',
        data: {
          content: verificationContent,
          slug: 'migration-verification-delete-me',
          title: 'Migration verification delete me',
        },
        draft: true,
        overrideAccess: false,
        user: login.user,
      })
      await payload.update({
        collection: 'blog',
        data: {
          content: verificationContent,
          excerpt: 'Authenticated edit and publish verification',
          slug: 'migration-verification-delete-me',
          title: 'Migration verification delete me',
        },
        draft: false,
        id: draft.id,
        overrideAccess: false,
        user: login.user,
      })
      await payload.delete({
        collection: 'blog',
        id: draft.id,
        overrideAccess: false,
        user: login.user,
      })
    } else {
      const work = await payload.create({
        collection: 'works',
        data: {
          category: 'installation',
          slug: 'migration-verification-delete-me',
          title: 'Migration verification delete me',
          year: 2026,
        },
        overrideAccess: false,
        user: login.user,
      })
      await payload.update({
        collection: 'works',
        data: { subtitle: 'Authenticated edit verification' },
        id: work.id,
        overrideAccess: false,
        user: login.user,
      })
      await payload.delete({
        collection: 'works',
        id: work.id,
        overrideAccess: false,
        user: login.user,
      })
    }

    let anonymousDenied = false
    try {
      await payload.create({
        collection: site === 'fredrik' ? 'guestbook-entry' : 'works',
        data:
          site === 'fredrik'
            ? { message: 'must not persist', name: 'anonymous verification' }
            : {
                category: 'installation',
                slug: 'anonymous-verification-must-not-persist',
                title: 'anonymous verification must not persist',
                year: 2026,
              },
        overrideAccess: false,
      } as never)
    } catch {
      anonymousDenied = true
    }
    if (!anonymousDenied) throw new Error(`${site} anonymous write was not denied`)

    if (writeCredentials) {
      await writeFile(
        path.resolve(credentialsArg),
        `${JSON.stringify({ email: identity.email, password, site }, null, 2)}\n`,
        { flag: 'wx', mode: 0o600 },
      )
    }
    console.log(JSON.stringify({ authenticatedEditVerified: true, site, userID: user.id }))
  } finally {
    await payload.destroy()
  }
}

await main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
process.exit(0)
