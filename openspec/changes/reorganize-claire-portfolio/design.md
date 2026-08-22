## Context

See `proposal.md` for the motivation and the three delta specs for observable behavior.

`apps/claire` is a Next.js 16 App Router application with Payload 3.87, Turso-backed SQLite, and R2 media storage. The current `works` collection uses a category field to distinguish installation, film, and performance records. One generic `/works/[slug]` page renders every category. Page-level copy lives in Payload globals, while the homepage selects up to three records through `featured` and `sortOrder` fields.

The current visual system already supplies a suitable base: Bodoni Moda and Karla, a warm neutral palette, generous spacing, monochrome homepage media, and image-led project rows. The live review found no console errors. It also found issues that matter to this redesign: the fixed navigation has no active state or guaranteed contrast treatment, keyboard focus is not styled on most links, there is no skip link, the homepage loop has no pause or reduced-motion behavior, several calls to action use `transition-all`, and some full-width source images are only 640 pixels wide.

The existing platform and safety constraints remain binding. Production content changes require an inventory, verified backup, rehearsal against copied data, parity checks, and a rollback path. Existing R2 object keys must remain valid.

## Goals / Non-Goals

**Goals:**

- Make the public routes and Payload editor navigation match Claire's terminology.
- Give installations, exhibitions, and films distinct schemas and reusable templates.
- Keep installation-exhibition links consistent through one stored relationship.
- Preserve current URLs, media references, and the homepage composition through migration.
- Improve accessibility, media quality guidance, metadata, and responsive behavior as part of the reorganization.
- Keep the implementation small enough for Claire to maintain through Payload without developer help.

**Non-Goals:**

- Inventing a new homepage concept before Claire has a direction for it.
- Adding a new design system package, animation library, search service, DAM, or video provider.
- Rewriting existing biography, project descriptions, credits, or CV content without Claire's editorial approval.
- Deleting the old Works table or old media objects during this change.
- Adding individual detail routes for every Dance credit. Dance remains one curated career page in this version.

## Decisions

### Use separate Payload collections for the three art-project types

Create `installations`, `exhibitions`, and `films` collections. Each collection gets its own required fields, admin labels, default columns, draft versions, generated slug, sort order, and frontend route.

This is preferable to extending the current category-driven Works collection. Separate collections make the editor clearer and keep type-specific validation out of a long set of conditional fields. They also produce direct typed queries and routes. Shared field factories will cover credits, gallery items, playback media, publishing fields, and list-card media so the schemas do not drift.

Alternative considered: keep `works` and add `exhibition` as a category. That would reduce migration work, but editors would continue to see irrelevant fields and the public templates would rely on category branching. It does not solve the core information-model problem.

### Store included installations on the exhibition

Each Exhibition stores an ordered, many-value relationship named `includedInstallations`. Exhibition pages render that field directly. Installation pages query published exhibitions whose relationship contains the installation ID and label the result `Presented in`.

The exhibition is the natural place for Claire to curate its list of works and ordering. One stored relationship avoids contradictory fields on two documents. The reverse query should select only the card fields it needs and use an indexed relationship.

Alternative considered: store `presentedIn` on installations or maintain relationships on both collections. The former makes exhibition editing awkward; the latter permits drift.

### Model Dance as a curated global

Replace the current Performance page global with a `dance` global containing introduction copy, showreel playback, a performance-footage array, and selected-stage-work entries. Existing performance-category records move into that structure only after Claire approves the mapping.

A global matches the requested single career page and avoids a fourth project system. If Claire later wants deep stage-work archives, a separate change can promote selected stage work to a collection without altering the art catalogs.

### Keep contact data in Site Settings

The About page will continue to own portrait, biography, and practice copy. It will read email, phone, Vimeo, and Instagram from `site-settings`, which remains the single source used by the footer. The Contact global and page retire after their useful text is reviewed and moved or discarded.

This avoids editing the same contact details in About and the footer.

### Add the PDF to the existing CV global

Add a PDF-only `fullPdf` upload relationship and a human-readable download filename to the CV global. The View action links to the public media URL. A same-origin `/cv/download` route streams the file and sets `Content-Disposition: attachment`, so download behavior does not depend on a cross-origin `download` attribute.

The route must stream the upstream response rather than buffer it in memory. It returns a useful unavailable response when no published PDF exists.

### Use a polymorphic homepage selection

Replace the implicit `featured` query over Works with an ordered `featuredProjects` relationship in the Home global that can point to Installations, Exhibitions, or Films. A small mapper normalizes the selected relation into the existing homepage card shape and canonical href.

The homepage components and composition stay in place. Moving the selection to Home gives Claire explicit control over ordering and avoids merging three collection queries.

### Use Server Components and direct Payload reads

Index and detail routes remain Server Components that query Payload directly. Detail loaders use React `cache` so page rendering and metadata share one fetch. Independent reads start together with `Promise.all`. Queries select only fields used by index cards or metadata, and anonymous pages request published content only.

No client data-fetching library is needed. Client code is limited to the mobile menu and homepage video controls.

### Evolve the current visual language instead of replacing it

Keep the typefaces, neutral palette, spacing scale, and current homepage. New index pages use large page titles, restrained metadata, and image-led rows or grids. Detail templates share a media-first shell but preserve distinct reading patterns:

- Installation pages pair the description with materials, dimensions, credits, and `Presented in` links before the media sequence.
- Exhibition pages pair the overview with venue and dates, then show installation documentation and an ordered list of included installations.
- Film pages place the thumbnail or hero and video first, followed by description and credits.
- Dance uses a showreel-led editorial page, not the visual-art project shell.

Shared components include project index cards, media heroes, galleries, playback, credits, project metadata, related-project links, and empty-state handling. Components receive explicit hrefs instead of assuming `/works/{slug}`.

### Treat accessibility and media quality as part of the templates

Add a visible-on-focus skip link, a stable `main` target, global `focus-visible` styling, an active navigation state, and a navigation surface or scrim that preserves contrast over unknown hero images. The mobile drawer gets `aria-expanded`, `aria-controls`, Escape handling, focus management, scroll containment, and a reduced-motion transition.

The homepage video gets a labelled pause/play control. A reduced-motion query prevents autoplay and shows the existing poster. Replace `transition-all` with property-specific transitions. Headings use balanced wrapping, and fixed-header targets use scroll margin.

Continue using `next/image` with accurate `sizes`, priority only for the page's leading image, and lazy loading below the fold. Payload admin copy will state recommended source dimensions for hero and card media, and the migration inventory will flag images that are smaller than their display role. The current 640-pixel full-width sources should be replaced when Claire can supply larger originals, but missing replacements do not justify discarding existing records.

### Preserve old URLs with a compatibility resolver

Use canonical routes `/installations/[slug]`, `/exhibitions/[slug]`, and `/film/[slug]`, plus index routes and `/dance`. Retired section routes use permanent redirects. Keep `/works/[slug]` as a small server resolver that consults the approved migration mapping or the new collections and permanently redirects to the matching canonical route.

The resolver lets old bookmarks and search results survive even after the old collection is no longer used by the public pages. Canonical metadata and the sitemap expose only the new routes.

## Risks / Trade-offs

- [The same slug can exist in more than one new collection] -> Validate global slug uniqueness during migration and creation, or store an explicit legacy-slug route map.
- [A draft relationship could expose an unpublished title] -> Reverse queries and relationship rendering must filter to published records for anonymous visitors.
- [Payload draft behavior changes query results] -> Add explicit published-only query helpers and test preview/admin behavior separately.
- [Migration classification requires artistic judgment] -> Generate a complete mapping for Claire to approve; leave ambiguous records untouched until approval.
- [New collections increase schema and migration size] -> Add them first, keep old data intact, and remove no database table in this change.
- [The CV download route adds function bandwidth] -> Stream without buffering, retain the direct View link, and measure the final PDF size before launch.
- [Full-width images can look soft] -> Flag undersized source assets in the inventory, publish recommended dimensions in Payload, and replace assets as Claire supplies originals.
- [A fixed navigation treatment could compete with artwork] -> Use a restrained background or contrast scrim and verify it against every hero at desktop and mobile sizes.

## Migration Plan

1. Export a production content inventory and create a record-by-record destination map, including legacy slug, destination type, destination slug, retained fields, media IDs, and unresolved questions.
2. Ask Claire to approve every ambiguous classification and the initial installation-exhibition relationships.
3. Create and verify the required database and object manifests under the existing backup procedure. Restore the database backup to a rehearsal target.
4. Deploy the additive schema: new collections, new global fields, and generated types. Keep Works, Performance, Contact, and all old public routes operational.
5. Run an idempotent migration against the rehearsal database. Compare record counts, slugs, media references, rich text, credits, and selected ordering with the approved map.
6. Test the new routes, reciprocal relationships, drafts, metadata, sitemap, responsive layouts, keyboard flow, reduced motion, video playback, and CV PDF actions against the rehearsal data.
7. Create a fresh verified production backup, run the reviewed migration, and deploy the new navigation and routes. Keep the old Works data and media objects untouched.
8. Smoke-test the homepage, every index, every migrated detail route, representative legacy redirects, About contact details, Dance media, CV view and download, and Payload editing.
9. Roll back the application deployment if parity or smoke checks fail. Because the change is additive and old data remains, the prior application can continue reading the old Works and globals. Restore the pre-migration database only if the migration altered existing records rather than adding new ones.

## Open Questions

- Claire needs to confirm the destination type for each existing record, especially whether ON REPEAT and Tides & Threads represent exhibitions, individual installations, or both through separate linked entries.
- Claire needs to choose which current project image should remain on the homepage after the featured selection moves to the new collections.
- The final PDF filename and any larger source images can be supplied during content preparation without changing the architecture or task order.
