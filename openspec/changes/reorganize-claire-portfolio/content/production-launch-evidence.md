# Production launch evidence

Recorded 2026-08-22 for the production launch at `https://clairefoody.com`.

## Fresh recovery gate

- Backup directory: ignored local path `apps/claire/data/production-backups/20260822T185229Z/`.
- The pre-migration read transaction copied 32 application tables and 188 rows, including 6 Works, 75 Media records, and 4 applied migrations.
- `PRAGMA integrity_check` and `PRAGMA foreign_key_check` passed.
- The portable SQL dump restored successfully with matching Works, Media, and migration counts.
- Pre-migration database SHA-256: `0e41e1b8acc8d3699f9c0430e0630e7652e9ddc486ed78a37560575df7b9aca7`.
- SQL dump SHA-256: `f50adcedc9a5f2f0b3566544634ba8932f28ac4546e3ab5c0959de6c40478ddf`.
- Restore-check database SHA-256: `8edb07e8fbb3b7671313d4a7fa6b6c78b3e18a5e4915f20b6ef9f79d7f9e0bee`.
- The media manifest verified 70 of 75 public objects. The five missing objects had no active or versioned references and did not block launch.
- Media manifest SHA-256: `655b42637e5d5e707f94424ca781bffb69dd0c5beb3be3d06e56b12ff707cef4`.

## Fresh-snapshot rehearsal and production migration

- The portfolio schema migration ran after both existing Pi-playback migrations on a copy of the fresh production backup.
- The idempotent content migration created 3 Exhibitions and 2 Films, updated Home and Dance, and retained all 6 Works.
- The parity command verified every mapped title, slug, media relationship, featured selection, and destination.
- The same additive schema and content migration then ran against production and passed the same parity command.
- No legacy table, Works record, media record, or R2 object was deleted or rewritten.

## Deployment and smoke checks

- Final source commit: `480b70c60c60f73454e5e57cd9578ba485b34e73`.
- Final Vercel deployment: `dpl_8VzHKdGhb3xnuiXQT6egCMH1B4cY` (`website-claire-pnh3eeh9x-fredrik-august-madsen-malmos-projects.vercel.app`).
- Vercel reported `READY` and aliased the deployment to `clairefoody.com` and `claire-cms.vercel.app`.
- Homepage, Installations, Exhibitions, all three migrated exhibition details, Film, both migrated film details, Dance, About, CV, Payload admin, sitemap, and Pi playback API returned 200.
- `/cv/download` returned the intended unavailable response because production has no published CV PDF.
- `/works`, `/performance`, `/contact`, and all six mapped `/works/{slug}` URLs returned permanent 308 redirects to their canonical destinations.
- Browser checks confirmed the monochrome homepage video plays and loops, the removed playback control is absent, navigation backdrop blur is `none`, and there is no horizontal overflow.
- A 390 by 844 check confirmed the same looping video behavior, the complete mobile navigation order, body scroll containment while the menu is open, and no horizontal overflow.
- Streamed exhibition and film detail bodies appeared after hydration with no browser console errors.
- The new Installations editor accepted a concurrent `WASH` draft autosave after deployment. It was observed read-only and not modified by this rollout.
- The production error-log scan returned no errors during the deployment and smoke-test window.

## Post-deploy parity and rollback

- The post-deploy read transaction copied 60 application tables and 284 rows.
- Counts were 6 retained Works, 1 externally created Installation draft, 3 Exhibitions, 2 Films, 75 Media records, and 5 applied migrations.
- Post-deploy integrity and foreign-key checks passed.
- Post-deploy database SHA-256: `679d419edf28df92d9affa10241eb49c847d14a612b2defc1a6a65235b27bb53`.
- The pre-change application deployment remains READY at `website-claire-b6jiixbd3-fredrik-august-madsen-malmos-projects.vercel.app`, backed by commit `0b36812bf5ecd8861bcf38ce890f663210bbed05`.
- Application rollback remains possible by promoting that deployment. The database migration is additive, and the pre-change app can continue reading the retained Works and legacy globals. The verified pre-migration database and SQL dump remain available if a database restore is ever required.
