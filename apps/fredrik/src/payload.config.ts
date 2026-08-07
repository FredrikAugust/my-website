import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Blog } from './collections/Blog'
import { BlogImage } from './collections/BlogImage'
import { GuestbookEntry } from './collections/GuestbookEntry'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const r2Enabled = Boolean(
  process.env.S3_BUCKET &&
  process.env.S3_ENDPOINT &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY,
)
const mediaURL = (prefix: string | undefined, filename: string) => {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '')
  const key = [prefix, filename]
    .filter((part): part is string => Boolean(part))
    .map(encodeURIComponent)
    .join('/')
  return base ? `${base}/${key}` : key
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  serverURL: process.env.SERVER_URL!,
  collections: [Users, Blog, BlogImage, GuestbookEntry],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    allowIDOnCreate: true,
    autoIncrement: true,
    client: {
      authToken: process.env.TURSO_AUTH_TOKEN,
      url: process.env.TURSO_DATABASE_URL || 'file:./data/fredrik.db',
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
      clientUploads: { access: ({ req }) => Boolean(req.user) },
      collections: {
        'blog-image': {
          prefix: 'blog-uploads',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => mediaURL(prefix || 'blog-uploads', filename),
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
      },
    }),
  ],
})
