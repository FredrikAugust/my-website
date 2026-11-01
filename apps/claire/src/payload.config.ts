import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Exhibitions } from './collections/Exhibitions'
import { Films } from './collections/Films'
import { Installations } from './collections/Installations'
import { Users } from './collections/Users'
import { Work } from './collections/Work'
import { About } from './globals/About'
import { CV } from './globals/CV'
import { Contact } from './globals/Contact'
import { Film as FilmGlobal } from './globals/Film'
import { Dance } from './globals/Dance'
import { Home } from './globals/Home'
import { PiPlayback } from './globals/PiPlayback'
import { Performance as PerformanceGlobal } from './globals/Performance'
import { SiteSettings } from './globals/SiteSettings'
import { Works as WorksGlobal } from './globals/Works'
import { migrations } from './migrations'
import { MAX_MEDIA_BYTES, mayUploadDirectly } from './lib/mediaPolicy'
import { publicObjectUrl } from './lib/mediaStorage'
import { applyImmutableMediaCache } from './lib/r2Cache'
import { enforceR2UploadPolicy } from './lib/r2UploadPolicy'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const r2Enabled = Boolean(
  process.env.S3_BUCKET &&
  process.env.S3_ENDPOINT &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY,
)
const mediaURL = (prefix: string | undefined, filename: string) =>
  publicObjectUrl(filename, prefix, process.env.S3_PUBLIC_URL) ||
  [prefix, filename].filter(Boolean).join('/')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  serverURL: process.env.SERVER_URL!,
  collections: [Users, Media, Work, Installations, Exhibitions, Films],
  globals: [
    Home,
    SiteSettings,
    About,
    CV,
    Dance,
    Contact,
    PerformanceGlobal,
    FilmGlobal,
    WorksGlobal,
    PiPlayback,
  ],
  maxDepth: 2,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  upload: {
    abortOnLimit: true,
    limits: { fileSize: MAX_MEDIA_BYTES },
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    allowIDOnCreate: true,
    autoIncrement: true,
    client: {
      authToken: process.env.TURSO_AUTH_TOKEN,
      url: process.env.TURSO_DATABASE_URL || 'file:./data/claire.db',
    },
    push: false,
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
    wal: true,
  }),
  sharp,
  plugins: [
    s3Storage({
      alwaysInsertFields: true,
      enabled: r2Enabled,
      // Browser PUTs go to the R2 S3 endpoint, so the bucket CORS policy must allow
      // this site's origin to PUT with content-type, content-length, and if-none-match.
      // The rule itself lives in Cloudflare, not this repo. See README "Browser upload CORS".
      clientUploads: { access: mayUploadDirectly },
      collections: {
        media: {
          prefix: 'claire-media-uploads',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            mediaURL(prefix || 'claire-media-uploads', filename),
        },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.S3_REGION || 'auto',
        // Default checksum signing adds headers the admin upload does not send, and R2
        // then rejects the PUT. The media row must not be created for that rejection.
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      },
    }),
    enforceR2UploadPolicy,
    applyImmutableMediaCache,
  ],
})
