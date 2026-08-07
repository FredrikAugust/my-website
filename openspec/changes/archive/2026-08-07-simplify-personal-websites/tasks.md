## 1. Frozen Source Baseline

- [x] 1.1 Inventory every live Neon database/branch/role, AWS website bucket/prefix, Vercel project/domain, Cloudflare zone, repository, and credential location without recording secret values.
- [x] 1.2 Back up all six PostgreSQL databases and restore each into disposable PostgreSQL 17 with schema, row-count, and deterministic content-hash parity.
- [x] 1.3 Copy and checksum all 80 website objects from the three in-scope S3 buckets/prefixes, preserving metadata and verifying every byte.
- [x] 1.4 Create clone-tested git bundles/tags for all three repositories and sign the phase-zero report in the plain local migration directory.
- [x] 1.5 Record the owner-declared write freeze: the completed verified snapshot is final, and no later source backup, delta, or time-based re-verification is required unless a write occurs.

## 2. Monorepo and Stable Baseline

- [x] 2.1 Move Fredrik to `apps/fredrik`, import Claire to `apps/claire`, retain the old repositories as rollback copies, and verify byte parity with their committed sources.
- [x] 2.2 Add one pnpm workspace, lockfile, Node 24.19.0/pnpm 10.28.1 policy, unique package names, and direct root commands.
- [x] 2.3 Replace duplicate Docker/GHCR workflows with one path-aware source-check workflow for both applications.
- [x] 2.4 Add per-app `vercel.json` files and document exact monorepo root/unaffected-project settings without switching live projects early.
- [x] 2.5 Align both apps on stable Next 16.3.0, React 19.2.8, Payload 3.87.0, TypeScript 5.9.3, one Oxfmt/Oxlint stack, current direct dependencies, and a zero-vulnerability production audit.
- [x] 2.6 Disable PostgreSQL schema push explicitly, verify every committed source migration, and regenerate Payload types/import maps.
- [x] 2.7 Pass restored-data integration tests and production builds for Fredrik content/media/guestbook/admin data and Claire works/globals/images/PDF/MP4/admin data.

## 3. One-Time PostgreSQL-to-Turso Conversion

- [x] 3.1 Inventory the Payload collections, globals, drafts, versions, relationships, guestbook records, media references, and stable IDs that the frozen canonical export must preserve; exclude sessions, locks, caches, password hashes, and migration ledgers.
- [x] 3.2 Implement one small canonical exporter against the verified PostgreSQL restores with deterministic per-entity counts and hashes.
- [x] 3.3 Replace both application adapters with Payload SQLite, use gitignored local database files, disable schema push, and generate clean committed SQLite migrations.
- [x] 3.4 Implement the one-time importer, convert both frozen exports into fresh SQLite databases, and verify counts, hashes, critical queries, drafts/versions, relationships, guestbook operations, globals, and media references.
- [x] 3.5 Recreate the two administrator identities with new passwords, verify login/edit/publish/logout, create one portable dump/database copy per site in the migration directory, and restore each once.

## 4. Turso and R2 Destination

- [x] 4.1 Recheck Turso pricing once, confirm the measured data fits Free or Developer under USD 6/month, and provision separate Fredrik/Claire databases through the Vercel Marketplace integration.
- [x] 4.2 Import the already-verified SQLite databases into Turso, issue separate database-scoped production tokens, and verify site isolation and content counts.
- [x] 4.3 Create separate Fredrik/Claire R2 buckets, public media hostnames, minimal CORS, and separate write credentials.
- [x] 4.4 Configure both Payload storage adapters for R2 client uploads in production and local files in development; copy the frozen local S3 backup into the matching buckets exactly once.
- [x] 4.5 Verify object key/count/size/checksum parity plus every database-referenced image, PDF, and MP4 through the new public media origins.

## 5. Claire Video and Free Performance Wins

- [x] 5.1 Restrict Claire media to the existing image/document types plus MP4 up to 500 MiB and require authenticated direct-to-R2 client uploads so video bytes bypass Vercel functions.
- [x] 5.2 Require a poster for selected hero video, add optional uploaded work video with deterministic precedence over Vimeo, and implement poster-backed inline/controlled playback with a fallback link.
- [x] 5.3 Audit both sites' image components and apply only free wins: `next/image`, responsive `sizes`, stable dimensions, AVIF/WebP, one true LCP priority image, lazy loading, and long-lived immutable media cache headers.
- [x] 5.4 Test anonymous upload denial, MIME/size rejection, failed upload recovery, poster validation, video precedence, range playback, and representative optimized image responses.

## 6. Same-Session Cutover and Retirement

- [x] 6.1 Replace the stale READMEs with one short root guide covering setup, commands, Vercel roots, local SQLite/media, one-time restore, deployment, video, provider ownership, and rollback from the verified local snapshot.
- [x] 6.2 Remove Dockerfiles, Compose/MinIO, GHCR, PostgreSQL runtime packages, active Neon/AWS/OpenTofu references, and obsolete infrastructure scripts while retaining only labeled migration evidence and disposable restore tooling.
- [x] 6.3 Connect both existing Vercel projects to the monorepo, set `apps/fredrik` and `apps/claire` roots, preserve domains, configure Turso/R2 values, enable unaffected-project skipping, and verify an app-only change skips the other project.
- [x] 6.4 Deploy Fredrik first and run a short smoke of public/blog/admin/guestbook/media routes, content counts, writes, and error logs.
- [x] 6.5 Deploy Claire immediately after Fredrik passes and smoke public/work/admin/global/image/PDF/direct-MP4/poster/range behavior and error logs.
- [x] 6.6 Present the exact Neon, AWS, old-repository, and infrastructure-repository deletion targets and obtain explicit owner approval; there is no waiting-period gate.
- [x] 6.7 After approval, delete retired Neon and AWS resources manually, revoke their credentials, verify billing/live references are gone, and never run `tofu destroy`.
- [x] 6.8 Archive then delete/disconnect `website-claire` and `personal-cluster` locally/remotely after approval, leaving the verified git bundles as the compact history backup.
- [x] 6.9 Run final workspace checks, production smoke, provider/cost inventory, strict OpenSpec validation, and record the final Vercel/Turso/Cloudflare-only platform.
