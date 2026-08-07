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

## Restore and rollback

The one-time migration tooling is in `scripts/migration/`. The verified final source snapshot is outside the repository at `../personal-websites-migration/20260806-simplify-personal-websites/`, including six PostgreSQL restores, 80 checksummed objects, canonical Payload JSON, portable SQLite databases, new admin credentials, and git bundles. No later delta is needed unless the write freeze is broken.

To restore data, provision empty Turso databases, run committed migrations, then run `scripts/migration/import-payload.ts` with the matching canonical JSON. Copy media with `scripts/migration/copy-to-r2.mjs`. For immediate rollback before provider retirement, point Vercel back to the preserved old project/database/storage values or redeploy the old repository bundle. Provider and repository deletion always requires explicit approval of the exact targets.
