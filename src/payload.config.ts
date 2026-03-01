import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Blog } from "./collections/Blog";
import { BlogImage } from "./collections/BlogImage";
import { GuestbookEntry } from "./collections/GuestbookEntry";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const databaseCaFromFilePath = path.resolve(dirname, "../certs/rds-global-bundle.pem");
const databaseCaFromEnv = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
const databaseCaFromFile = (() => {
  try {
    return readFileSync(databaseCaFromFilePath, "utf8");
  } catch {
    return undefined;
  }
})();
const databaseCa = databaseCaFromFile ?? databaseCaFromEnv;
const databaseUri = process.env.DATABASE_URI!;
const databaseConnectionString = databaseUri
  .replace(/([?&])sslmode=[^&]*&?/i, "$1")
  .replace(/[?&]$/, "");

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
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    push: true,
    pool: {
      connectionString: databaseConnectionString,
      ssl: databaseCa
        ? {
            ca: databaseCa,
            rejectUnauthorized: true,
          }
        : undefined,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        "blog-image": {
          prefix: "blog-uploads",
        },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        endpoint: process.env.S3_ENDPOINT!,
        forcePathStyle: process.env.S3_ENDPOINT!.startsWith(
          "http://localhost:9000",
        ),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
      },
    }),
  ],
});
