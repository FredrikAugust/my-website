## Why

Two hobby websites currently require three repositories, duplicated build tooling, a paid Neon PostgreSQL tier, AWS media infrastructure, and an OpenTofu control plane that is more complex and expensive than the sites it serves. Consolidating the code and moving these low-write CMS workloads to a small serverless database will lower cost and maintenance effort while making Claire's existing video fields usable for real uploads.

## What Changes

- **BREAKING**: Merge `my-website` and `website-claire` into one pnpm monorepo with `apps/fredrik` and `apps/claire`, one lockfile, one dependency policy, and one CI workflow; retain two independently deployable Vercel projects and domains.
- **BREAKING**: Migrate each Payload application from its own Neon PostgreSQL database to its own Turso libSQL database using Payload's SQLite adapter and the Vercel Marketplace Turso integration. Use local SQLite files for development, read-only Turso tokens or disposable database copies for previews, and the Turso Free or Developer tier according to verified size and usage.
- Rehearse the complete PostgreSQL-to-SQLite conversion locally before provisioning production. Preserve published content, drafts, versions, globals, relationships, media references, and guestbook data; recreate the very small set of CMS administrator accounts with forced password resets instead of copying authentication secrets.
- Keep Prisma Postgres Starter as the explicit no-code-path fallback only if the Turso rehearsal fails schema, behavior, performance, or restore acceptance criteria. Do not fall back to Neon silently.
- **BREAKING**: Move the two production media sets from AWS S3 to two Cloudflare R2 buckets, eliminating AWS and its IAM users from the website platform while retaining isolation between the sites.
- Add direct-to-R2 client uploads for Claire's authenticated Payload admin so MP4 video uploads bypass Vercel function payload limits, with explicit type/size rules, poster images, and browser playback.
- Use the completed timestamped, no-clobber, verified backup in `../personal-websites-migration` as the final source baseline. The owner has frozen writes until rollout completes, so no later source snapshot or waiting period is required. Require SQLite export/import verification, critical-flow parity, a short production smoke test, and explicit approval immediately before deleting a source.
- Remove production Docker image builds, GHCR publishing, duplicated Dockerfiles, and all Compose services; local development uses SQLite files and Payload's local media storage with path-aware checks for both applications.
- Standardize both applications on the same supported Node, pnpm, Next.js, React, Payload, TypeScript, formatting, and linting baseline, updating generated Payload artifacts and tests with the upgrade.
- **BREAKING**: Move environment variables and domain configuration to provider dashboards, revoke credentials for providers removed by this rollout, detach resources without running OpenTofu destroy, and archive/delete `personal-cluster` after the same-session production smoke and explicit deletion checkpoint.
- Replace template and stale documentation with a short root README plus backup/restore, deployment, media, and provider ownership runbooks.
- Document the evaluated database alternatives—Prisma Postgres, Aiven, Railway, Supabase, Render, and Fly—as well as the more radical shared-CMS, content-in-Git, and single-VPS options and why Turso is the default.

## Capabilities

### New Capabilities

- `safe-site-data-migration`: Backup, frozen-source conversion, verification, restore, cutover, rollback, and immediate retirement requirements for all website database and blob data.
- `personal-websites-monorepo`: A single workspace that develops, checks, and deploys the two websites independently without duplicated repository tooling.
- `consolidated-site-platform`: Cost-bounded operation on Vercel, two isolated Turso databases, Cloudflare DNS/R2, and no infrastructure-as-code repository, AWS dependency, or paid Neon compute.
- `claire-video-media`: Authenticated direct video upload, validation, storage, metadata, poster, and playback behavior for Claire's website.
- `hobby-site-operations`: Minimal manual operations, dependency maintenance, secret rotation, provider inventory, and documentation requirements.

### Modified Capabilities

None. The repository has no existing OpenSpec capabilities.

## Impact

- Repositories: `my-website` becomes the monorepo; `website-claire` and `personal-cluster` are retired only after verified migration and explicit checkpoints.
- Applications: both Next.js/Payload applications, PostgreSQL-to-SQLite data conversion, database adapters, generated Payload types/import maps/migrations, local development, tests, CI, and Vercel root-directory settings.
- Data systems: every existing Neon production/dev database and branch, two new Turso databases and preview tokens/copies, AWS S3 buckets and IAM credentials, and new Cloudflare R2 buckets/custom media domains.
- Operations: Vercel environment variables and domains, Turso database/token/backup management, Cloudflare DNS/R2, database cost controls, the verified local backup, retired-provider credential revocation, and concise manual runbooks.
- Users: public URLs and content remain stable; CMS administrators reauthenticate with reset passwords after migration; Claire gains browser-based MP4 uploads and native playback.
