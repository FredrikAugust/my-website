import path from 'node:path'
import { fileURLToPath } from 'node:url'
// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Album } from './collections/Album'
import { Photo } from './collections/Photo'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  serverURL: process.env.SERVER_URL!,
  collections: [Users, Photo, Album],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI!,
    },
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    payloadCloudPlugin({}),
    s3Storage({
      collections: {
        photo: true,
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        endpoint: process.env.S3_ENDPOINT!,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
      },
    }),
  ],
})
