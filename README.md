# Personal websites

One small pnpm monorepo for two Next.js + Payload hobby sites:

| Site | Workspace | Vercel project/root | Production data |
| --- | --- | --- | --- |
| Fredrik | `@personal/fredrik` | `my-website` / `apps/fredrik` | Turso `personal-websites`, R2 `fredrik-website-media` |
| Claire | `@personal/claire` | `website-claire` / `apps/claire` | Turso `claire-website`, R2 `claire-website-media` |

Vercel owns deployments and environment variables, Turso owns the two isolated SQLite databases, and Cloudflare R2 owns media. There is no application IaC, container runtime, managed PostgreSQL, or AWS runtime.

## Local setup

Use Node 24.19.0 and pnpm 10.28.1, then:

```bash
pnpm install
cp apps/fredrik/.env.example apps/fredrik/.env.local
cp apps/claire/.env.example apps/claire/.env.local
pnpm migrate
pnpm dev
```

Local databases and uploads live under each app's gitignored `data/` directory. R2 variables are optional locally. Fredrik runs on port 3000; use `PORT=3001 pnpm dev:claire` when running both sites.

Common commands are `pnpm dev:fredrik`, `pnpm dev:claire`, `pnpm generate`, `pnpm migrate`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

## Deployment and media

Both existing Vercel projects use this repository with “Include source files outside Root Directory” and “Skip deployments when there are no changes” enabled. Root-only or lockfile changes can deploy both; an app-only change should deploy only its project. Keep the existing domains attached.

Production migrations run against the Vercel-provisioned `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Media uses bucket-specific `S3_*` R2 credentials and `S3_PUBLIC_URL`; browser uploads are authenticated and go directly to R2. Claire accepts JPEG, PNG, HEIC, PDF, and MP4 up to 500 MiB. Hero and work videos require an image poster; an uploaded work MP4 takes precedence over Vimeo.

### Browser upload CORS

Claire's admin uploads with a presigned PUT to the R2 S3 endpoint (`S3_ENDPOINT`), not to `media.clairefoody.com`. That bucket CORS policy is set in Cloudflare and cannot be changed from this repo. A missing or incomplete policy makes the browser PUT fail. Payload saves a media row only after `HeadObject` confirms the object exists, so a rejected PUT shows an error in the admin instead of a record that 404s later.

Presigned PUTs are valid for 10 minutes and send `Content-Type`, `Content-Length`, and `If-None-Match: *` (the last header makes R2 reject a PUT that would overwrite an existing key). The S3 client asks for checksums only when the operation requires them, because the admin does not send `x-amz-checksum-*` headers. R2's single PUT limit is 5 GiB; this app rejects anything over 500 MiB before signing. Payload 3.92 stores each new object at `claire-media-uploads/<object key>/<filename>`. Older objects stay at `claire-media-uploads/<filename>`. `/api/media/file/<filename>` redirects to the path that media row actually uses.

For bucket `claire-website-media`, confirm a rule equivalent to:

```json
[
  {
    "AllowedOrigins": [
      "https://clairefoody.com",
      "https://www.clairefoody.com",
      "https://*.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["content-type", "content-length", "if-none-match"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Origins must match the browser `Origin` header exactly, with no path and no trailing slash. R2 allows a single `*` in an origin, so `https://*.vercel.app` covers `website-claire.vercel.app` and preview hosts such as `website-claire-git-branch-team.vercel.app`. If the dashboard rejects that wildcard, list each origin you actually upload from. `If-None-Match` has to be allowed or every admin upload fails the CORS preflight.

## Restore and rollback

The one-time migration tooling is in `scripts/migration/`. The verified final source snapshot is outside the repository at `../personal-websites-migration/20260806-simplify-personal-websites/`, including six PostgreSQL restores, 80 checksummed objects, canonical Payload JSON, portable SQLite databases, new admin credentials, and git bundles. No later delta is needed unless the write freeze is broken.

To restore data, provision empty Turso databases, run committed migrations, then run `scripts/migration/import-payload.ts` with the matching canonical JSON. Copy media with `scripts/migration/copy-to-r2.mjs`. For immediate rollback before provider retirement, point Vercel back to the preserved old project/database/storage values or redeploy the old repository bundle. Provider and repository deletion always requires explicit approval of the exact targets.

## Operations

Provider changes are manual: update Vercel, Turso, or Cloudflare with their official dashboard or CLI, verify the affected site, and append a non-secret row below with the reason and recovery path. Do not introduce application IaC.

| Date | Change and verification | Recovery |
| --- | --- | --- |
| 2026-08-07 | Completed the monorepo cutover. Both Vercel projects deploy from their `apps/*` roots; Fredrik's app-only skip was verified against a Claire-only commit. Production smoke passed with 8 posts, 34 guestbook entries, 5 works, and 49 Claire media records. Source checks, integration tests, typechecking, linting, formatting, and the production dependency audit passed. | Redeploy this repository and restore the matching Turso database/R2 media from the verified migration snapshot. |
| 2026-08-07 | Retired Neon project `dark-salad-32922902`; AWS buckets `claire-website-cms`, `claire-website-cms-dev`, and `fredrik-website-cms`; their three IAM users; and the temporary AWS root key. Removed obsolete Vercel `DATABASE_URI` values. No OpenTofu destroy command was run. | Restore databases and objects from `../personal-websites-migration/20260806-simplify-personal-websites/`. |
| 2026-08-07 | Archived then deleted the old `website-claire` and `personal-cluster` GitHub repositories and moved their local working copies to Trash after verifying their git bundles. | Clone the verified bundles under the migration snapshot's `repositories/` directory. |

Quarterly, review Vercel usage/projects/domains, the two Turso databases and plan usage, the two R2 buckets and credentials, and the local snapshot. Remove anything unused; keep combined Turso database cost at or below USD 6/month unless explicitly reconsidered.
