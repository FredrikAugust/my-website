# Rehearsal evidence

Recorded 2026-08-22 before any production mutation.

## Database copy and restore

- Source access: read-only Turso transaction.
- Rehearsal target: ignored local SQLite file `apps/claire/data/claire-rehearsal-20260822.db`.
- Portable dump: ignored file `apps/claire/data/claire-rehearsal-20260822.sql`.
- Restore check: ignored file `apps/claire/data/claire-rehearsal-restorecheck-20260822.db`.
- Initial copy: 32 application tables, 170 rows, 6 Works, and 61 Media records.
- Original rehearsal database SHA-256: `d879c972a0483f5ccd2e2d19264122cb938656bdcd49d27f7290f8cdcb7374a9`.
- SQL dump SHA-256: `0b520941b9bea8feabb78db36820aefd9a648ba5592e5e2f278cc8971c048949`.
- Restored database SHA-256: `6577341644c39352ddb9603df86cdfe8ff2b8b348aa92ed6abcc6def0c858b87`.
- `PRAGMA integrity_check` and `PRAGMA foreign_key_check` passed on the rehearsal copy. Restored Works, Media, Home, and Users counts matched.

## Media manifest

- `r2-manifest.json` records all 61 Media rows and their public object URLs.
- 59 public objects returned successfully and matched stored byte lengths where a byte length was available.
- Media IDs 30 and 63 returned missing responses. A dynamic foreign-key scan found no active or versioned content references to either record, so they do not block the rehearsal.
- No object was copied, rewritten, or deleted. Local development uses the existing public read-only media URLs when a local file is absent.

## Migration and parity

- The additive Payload schema migration ran against the local database only.
- The idempotent content migration produced 3 Exhibitions, 2 Films, and the Dance selection while retaining all 6 legacy Works.
- A second migration run made no duplicate destination records.
- The parity script confirmed titles, slugs, media IDs, rich text, credits, homepage featured order, relationships, and retained Works against `mapping.json`.
- Development-only fixtures add 3 published Installations, reciprocal Exhibition links, Dance playback, a placeholder CV PDF, and 1 unpublished Installation for public-access testing. Fixture titles and filenames are explicitly labelled as development content.

## Application verification

- Formatting, lint, TypeScript, 11 tests, Payload type/import-map generation, and a production build passed against the local rehearsal database.
- Browser checks passed on desktop and a 390 by 844 viewport: exact navigation order, readable hero navigation, no horizontal overflow, visible keyboard focus, mobile scroll lock, Escape close, and focus restoration.
- All migrated destination pages and all mapped legacy redirects resolved to their expected routes.
- The unpublished Installation and an unknown Installation returned the public 404 state.
- Installation-to-Exhibition links were verified in both directions.
- The CV download route returned `200`, `application/pdf`, and an attachment filename.
- The sitemap contained the new indexes and published detail routes and omitted the unpublished fixture and retired URLs.
- Server output contained no application errors during the final browser pass; the only recurring runtime message was Payload's expected development warning that email is written to the console when no adapter is configured.
- A development-only admin account was created in the ignored rehearsal database. Through the Payload admin, the rehearsal exercised Installation draft creation, publishing and editing; Exhibition relationship editing; temporary homepage selection changes followed by restoration; temporary Dance heading changes followed by restoration; About contact display; and CV PDF removal and replacement.
- The admin-created published Installation rendered at `/installations/admin-workflow-sample`, and its reciprocal link appeared on `/exhibitions/saudade`.

## Production gate

Production remained untouched. A fresh production database backup, production object manifest, approved migration/deployment, production smoke test, admin editing exercise, and parity/rollback record are still required before launch.
