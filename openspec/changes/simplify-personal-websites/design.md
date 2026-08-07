## Context

See `proposal.md` for motivation. Today each site is a standalone Next.js application with an embedded Payload CMS, Neon PostgreSQL, and S3-compatible media storage. Both deploy to separate Vercel projects. The infrastructure repository describes Neon production and dev branches/databases, AWS S3 and IAM, Vercel projects/environment variables/domains, and Cloudflare DNS. Provider and application secrets have also been materialized in infrastructure files or state.

The sites are small CMS workloads: mostly public reads, infrequent authenticated edits, Fredrik's guestbook, and no use of Payload's Point field. Payload officially supports SQLite through its libSQL-based adapter and documents remote Turso deployment on Vercel. Turso provides database-scoped read-only tokens, copy-on-write database branches, portable SQLite dumps, and point-in-time recovery. This makes a cross-engine migration credible, but it is a larger data-safety change than swapping PostgreSQL providers and therefore requires a full local rehearsal and a tested reverse path.

Claire's schema already has a general `media` upload collection, an uploaded hero-video relationship, poster/fallback support, Vimeo embeds, and a native video component. Vercel functions accept only 4.5 MB request/response bodies, while Payload's S3 adapter supports `clientUploads` to bypass that limit and documents Cloudflare R2 as an S3-compatible target. Vercel also supports multiple projects rooted in one monorepo.

Relevant platform references:

- [Payload SQLite adapter](https://payloadcms.com/docs/database/sqlite)
- [Payload with SQLite and Turso on Vercel](https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel)
- [Turso pricing](https://turso.tech/pricing?frequency=monthly)
- [Turso scoped and read-only authorization](https://docs.turso.tech/sdk/authorization)
- [Turso branching](https://docs.turso.tech/features/branching)
- [Turso dumps](https://docs.turso.tech/cli/db/shell)
- [Turso point-in-time recovery](https://docs.turso.tech/features/point-in-time-recovery)
- [Prisma Postgres pricing](https://www.prisma.io/pricing)
- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Vercel function request-body limit](https://vercel.com/docs/functions/limitations#request-body-size)
- [Payload storage adapters and R2 client uploads](https://payloadcms.com/docs/upload/storage-adapters)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Goals / Non-Goals

**Goals:**

- Preserve both sites, CMS editing, drafts and versions, Fredrik's guestbook, independent domains, and recoverable source data.
- Reduce steady-state services to GitHub, Vercel, Turso, and the already-used Cloudflare account.
- Keep combined database subscription cost at USD 0 or USD 5.99 per month under current Turso plans, subject to verified usage.
- Make routine local development a single `pnpm` workflow with local SQLite and local media, without Docker or background data services.
- Make PostgreSQL-to-SQLite conversion and rollback evidence-driven, repeatable, and blocked on parity failures.
- Allow Claire to upload and publish MP4 files without proxying video bytes through Next.js.
- End with one repository, one dependency graph, one CI workflow, and short manual runbooks.

**Non-Goals:**

- Combining the two brands, domains, Payload schemas, databases, admin identities, or release lifecycles.
- Building video transcoding, adaptive streaming, or a digital-asset-management service.
- Copying password hashes, sessions, locks, caches, or old database migration ledgers across engines.
- Automatically choosing or provisioning a fallback database when Turso acceptance fails.
- Preserving OpenTofu or replacing it with another desired-state system.
- Removing Payload, the guestbook, or browser-based content editing in this change.

## Decisions

### 1. Use a plain pnpm monorepo, not a monorepo framework

`my-website` becomes the destination repository:

```text
personal-websites/
├── apps/
│   ├── fredrik/
│   └── claire/
├── docs/
│   ├── operations.md
│   ├── backup-restore.md
│   └── migration-report-template.md
├── scripts/
│   ├── migrate-database
│   ├── backup-platform
│   ├── verify-backup
│   └── verify-media
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

Root scripts call `pnpm --filter` directly. Vercel keeps two projects, each pointed at one `apps/*` root with unaffected-project skipping enabled. GitHub Actions installs once and runs a small matrix of application checks. No Turborepo or Nx cache is introduced. Claire's source is imported with history when safe; otherwise the old repository remains the history archive. Shared packages are created only for code both applications actually consume.

Alternatives considered:

- **One Next.js application routing by hostname:** couples every deployment and adds custom hostname infrastructure. Rejected.
- **Turborepo:** does not pay for itself with two applications because pnpm and Vercel already understand the workspace graph. Rejected.
- **Keep three repositories:** retains duplicated tooling and the infrastructure repository as a manual dependency. Rejected.

### 2. Use one Turso libSQL database per Payload application

Each application replaces `@payloadcms/db-postgres` with `@payloadcms/db-sqlite`. Turso is provisioned through the Vercel Marketplace integration and connects each Vercel project to its own database and generated environment values. Local development uses a gitignored SQLite file and Payload's local upload directory. Preview deployments are disabled or read-only; no disposable cloud branch is required for this frozen, same-session rollout.

Two databases preserve site isolation without schemas, roles, a shared server, connection pools, or a cross-site migration boundary. SQLite migrations are generated independently for each application. Runtime schema push is disabled in production. The selected Turso plan is based on measured source size and observed reads/writes: Free when the combined workload fits its 5 GB and usage/recovery envelope, otherwise Developer at USD 5.99 for 9 GB and a longer recovery window. Implementation stops for approval if neither plan fits.

The rollout creates one portable SQLite dump/database copy per site in the existing migration directory. Turso recovery is a convenience after rollout; no recurring backup system is added in this change.

### 3. Prisma Postgres Starter is the only pre-approved technical fallback, not the default

The current provider comparison is:

| Option | Current entry cost | Decision |
|---|---:|---|
| Turso | USD 0 Free / USD 5.99 Developer | Selected; lowest cost and removes local database infrastructure |
| Prisma Postgres | USD 10 Starter | Fallback; preserves PostgreSQL and Payload adapter behavior |
| Aiven | USD 0 Free | Rejected; one service, 1 GB, 20 connections, and no pooling is a poor Vercel boundary |
| Railway | USD 5 minimum plus usage | Rejected; PostgreSQL template is operator-managed and Vercel traffic uses billed public egress |
| Supabase | USD 0 Free / USD 25+ Pro | Rejected; free projects are small, pause, and lack automatic backups; paid does not meet the cost goal |
| Render / Fly Managed Postgres | Paid | Rejected; free Render databases expire and Fly starts far above the hobby budget |

Prices and limits are rechecked immediately before provisioning. If Turso fails the local acceptance gate, implementation stops with the failed evidence, measured Prisma operation estimate, expected monthly cost, and revised tasks. Prisma is provisioned only after explicit owner approval. There is no implicit return to Neon.

### 4. Convert at the Payload data boundary, not by translating SQL dumps

PostgreSQL and SQLite schemas, types, migration ledgers, and internal Payload tables differ. The migration therefore does not rewrite `pg_dump` SQL. It creates clean SQLite schemas from the current Payload configs and moves portable application records through a one-off, database-neutral export/import tool.

The canonical export contains collections, globals, drafts, version history, stable IDs, relationship IDs, guestbook entries, and media metadata/references at depth zero. It is stored only in the migration directory outside the repositories. Import order follows dependencies and temporarily enables explicit ID creation where necessary. The tool produces per-entity counts and deterministic hashes before and after import. Locks, sessions, caches, and migration ledgers are excluded explicitly. Administrator email identities are recreated with new passwords; password hashes and sessions are never exported.

The same canonical format remains usable for recovery. Because writes are frozen until rollout completes, pre-deletion rollback simply restores the prior Vercel configuration; after source deletion, recovery starts from the verified local snapshot. A reverse-conversion rehearsal is not required for this hobby-site rollout.

The already-frozen verified PostgreSQL restores are exported once and imported into new empty Turso databases. There is no final delta or later snapshot. Fredrik is deployed first as a short canary smoke, followed immediately by Claire when its critical checks pass.

### 5. Replace AWS S3 with two Cloudflare R2 buckets

Cloudflare is already required for DNS, so R2 removes AWS rather than adding a provider. Two buckets preserve least-privilege write isolation. Each uses a site-specific custom media hostname and separately revocable token. Public reads use the media hostname; S3 API endpoints are used only for writes and migration.

Both Payload configs retain `@payloadcms/storage-s3`, configured for R2 with `region: "auto"`, the R2 endpoint, path-style addressing, explicit public URL generation, and `clientUploads: true`. Browser PUT CORS is limited to approved production, preview, and localhost origins. In local development the plugin is disabled and Payload uses local storage, so MinIO and Compose are unnecessary.

Alternatives considered:

- **One bucket with prefixes:** shares a bucket-level write blast radius. Rejected.
- **Vercel Blob:** removes no provider because Cloudflare remains the DNS provider and R2 fits video delivery. Rejected.
- **Keep AWS S3:** preserves IAM and the infrastructure repository's largest surface. Rejected.
- **Vimeo-only:** does not satisfy direct upload and self-hosted playback. Vimeo remains optional.

### 6. Use Payload client uploads for bounded MP4 media

Claire's `media` collection remains the sole upload collection. It preserves images and documents and adds MP4 up to 500 MiB. The authenticated signed-URL flow uploads directly to R2, binding a generated key, MIME type, size, and short expiry. Payload creates the record only after storage succeeds.

The hero retains its video and fallback fields, with the poster mandatory when video is selected. Works gain an optional uploaded-video relationship alongside Vimeo. Uploaded work video renders with controls; the hero remains muted, looping, inline, and poster-backed. Delivery is verified for MIME, length, range, and cache headers. No transcoding is added; admin guidance specifies web-ready H.264/AAC MP4.

Low-cost performance work stays within the existing Next.js stack: use `next/image` for content images, emit AVIF/WebP, provide responsive `sizes`, reserve dimensions to prevent layout shift, preload only the real above-the-fold image, lazy-load the rest, and give immutable media long-lived cache headers. No image proxy, CDN service, or build-time image pipeline is added.

### 7. Treat the frozen verified snapshot as phase zero

No live database or source-object mutation starts until discovery and backup reports pass. Every Neon production/dev database and branch gets a custom-format `pg_dump`, safe globals metadata, schema/table/row inventories, and a verified disposable PostgreSQL restore. Every AWS bucket/prefix gets a version-aware local copy and strong local checksums. Multipart ETags are never treated as SHA hashes.

Backup output goes to `../personal-websites-migration`, outside all three repositories. The owner has explicitly chosen one plain local copy and frozen writes. That completed snapshot is final; no repeat verification or time-based source retention is required. Reports contain no connection strings or tokens. Deletion requires only passing the same-session smoke checklist and explicit approval of exact targets.

The local Turso rehearsal must prove forward conversion, public queries, authenticated edits, migrations, and one portable dump restore. Production database and media cutovers are per-site. Any parity mismatch stops promotion.

### 8. Replace IaC with a deliberately small manual control plane

Vercel projects/environment variables/domains, Turso databases/tokens/branches/plan usage, and Cloudflare DNS/R2 are changed in provider dashboards or official CLIs using a checklist. The monorepo records names, ownership, purpose, and non-secret settings; provider dashboards remain the source of truth. An append-only operations log records verification and rollback values without secrets.

OpenTofu is never used to destroy resources. After the replacement platform passes smoke checks, retired provider credentials are revoked with their resources. Surviving provider credentials are rotated only if a current live value is found in committed monorepo content. `website-claire` and `personal-cluster` can be archived and deleted in the same session after explicit approval.

### 9. Standardize dependencies and remove all persistent container machinery

The root pins one active Node LTS and pnpm version. Both apps move together to compatible stable Next.js, React, Payload, TypeScript, database-adapter, and storage-adapter releases; coupled Payload packages use exact matching versions. Fredrik's Next.js canary is removed. One formatter/linter stack remains.

Vercel builds source directly, so both Dockerfiles, Compose files, and GHCR workflows are removed. CI checks formatting, linting, generated artifacts, tests, and builds. Local SQLite and local media require no services. A disposable PostgreSQL container is permitted only for source-restore and reverse-migration verification when a native temporary server is unavailable.

## Risks / Trade-offs

- **[Cross-engine type or query semantics differ]** → Generate clean SQLite schemas, migrate through Payload data contracts, compare deterministic exports, and run every critical query and migration before approval.
- **[Drafts, versions, or relationships can be missed by a naive export]** → Inventory every collection/global/internal version table first and require entity-specific counts and hashes with approved exclusions.
- **[Rollback could lose writes accepted after cutover]** → Keep the owner-declared write freeze active until both sites pass smoke checks and source deletion is approved.
- **[Turso quotas or recovery limits can exceed the cheap plan]** → Measure source size and observed usage, configure alerts, keep portable verified local dumps, and stop for approval before exceeding USD 6/month.
- **[SQLite is a less familiar production engine]** → Keep each workload small and isolated, use Payload's supported adapter, monitor write latency/errors, and retain the Prisma Postgres fallback gate.
- **[Administrator password resets create brief friction]** → Schedule resets during each site's cutover and verify the new account before unfreezing writes.
- **[A monorepo commit can trigger both Vercel projects]** → Enable unaffected-project skipping and test root/shared dependency behavior.
- **[Direct uploads can leave an R2 object if record creation fails]** → Use collision-resistant keys and a conservative dry-run orphan report.
- **[No transcoding means poorly encoded MP4 can play badly]** → Document H.264/AAC export settings, validate MIME/size, require a poster, and retain Vimeo.
- **[Manual provider configuration can drift]** → Keep the inventory tiny, log changes, and run the quarterly provider/cost checklist.
- **[Repository deletion loses convenient history]** → Store verified git bundles in the protected migration directory and require deletion approval.

## Migration Plan

1. **Use the completed frozen baseline.** Keep the verified PostgreSQL, object, and git backups as the single authoritative source snapshot; do not repeat them while the write freeze holds.
2. **Finish the monorepo baseline.** Complete shared tooling, stable dependencies, explicit migrations, integration tests, and low-effort image optimization.
3. **Convert once.** Export the restored PostgreSQL application data, create clean local SQLite schemas, import both sites, and verify counts, hashes, critical queries, admin access, guestbook writes, and media references.
4. **Provision the small destination.** Create one Vercel Marketplace Turso database per site and one Cloudflare R2 bucket per site, then import/copy the already-verified frozen snapshot.
5. **Add Claire video support.** Enable authenticated direct MP4 upload, poster-backed playback, and basic MIME/size/range tests without transcoding.
6. **Switch and smoke.** Point both existing Vercel projects at their monorepo roots, preserve domains, deploy Fredrik then Claire, and run concise public/admin/data/media smoke checks.
7. **Retire immediately with approval.** Ask for explicit approval of the exact Neon, AWS, and repository targets; then delete retired resources, revoke their credentials, archive/delete `personal-cluster` and the old Claire repository, and record the final three-provider inventory.

Rollback is per site. Before source deletion, restore the previous Vercel root/environment values. After deletion, restore from the verified local PostgreSQL/object snapshot or its canonical export. The write freeze means no delta synchronization is needed, and the other site remains untouched.
