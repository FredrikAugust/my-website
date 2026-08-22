## 1. Content Inventory and Decisions

- [x] 1.1 Export a read-only inventory of every Works record, relevant global, media reference, slug, featured state, and public URL.
- [x] 1.2 Draft the record-by-record destination map for Installation, Exhibition, Film, Dance, or retained unpublished content, including proposed reciprocal relationships and legacy redirects.
- [x] 1.3 Review ambiguous classifications, homepage selections, and content gaps with Claire and record her approvals in the mapping.
- [x] 1.4 Flag undersized hero and card sources, missing alternative text, missing videos or posters, and the absent CV PDF for content follow-up.

## 2. Payload Schemas and Generated Types

- [x] 2.1 Add typed shared field factories for credits, galleries, playback, slugs, sorting, card media, and publishing fields.
- [x] 2.2 Add draft-enabled Installations, Exhibitions, and Films collections with type-specific fields, admin labels, validation, access rules, and useful default columns.
- [x] 2.3 Add the ordered Exhibition-to-Installation relationship and published-only reverse-query support for `Presented in` links.
- [x] 2.4 Replace the Performance global with the Dance global and add the required showreel, footage, and selected-stage-work fields.
- [x] 2.5 Extend Home with an ordered polymorphic featured-project relationship and extend CV with PDF and download-filename fields while retaining Site Settings as the contact source.
- [x] 2.6 Register the additive collections and globals, generate Payload types and the admin import map, and verify that the existing schemas remain readable.
- [x] 2.7 Add schema and access tests for drafts, published-only reads, media validation, relationship filtering, slug uniqueness, and CV PDF filtering.

## 3. Reusable Public Templates

- [x] 3.1 Refactor shared card, media hero, gallery, playback, credits, metadata, and related-project components to accept explicit project types and canonical hrefs.
- [x] 3.2 Build the Installations index and detail routes with materials, dimensions, credits, gallery or video, and derived `Presented in` links.
- [x] 3.3 Build the Exhibitions index and detail routes with overview, venue, city, dates, documentation media, credits, and ordered included installations.
- [x] 3.4 Build the Film index and detail routes with thumbnail, year, uploaded or Vimeo playback, description, and credits.
- [x] 3.5 Build the Dance page from its global, keeping showreel, performance footage, and stage work outside the visual-art project templates.
- [x] 3.6 Update About to include the practice statement and Site Settings contact details, and remove links that send visitors to the retiring Contact page.
- [x] 3.7 Update CV with View PDF and Download PDF actions and add a streaming same-origin download route with a safe filename and missing-file response.
- [x] 3.8 Adapt the existing homepage components to the polymorphic featured selection without changing the hero, featured-section, or practice-introduction composition.

## 4. Navigation, Accessibility, and Discovery

- [x] 4.1 Replace desktop, mobile, and footer navigation with Installations, Exhibitions, Film, Dance, About, and CV in the approved order, with current-page state and reliable contrast.
- [x] 4.2 Add the skip link, stable main-content target, global visible focus styles, fixed-header scroll margins, and balanced heading wrapping.
- [x] 4.3 Upgrade the mobile menu with `aria-expanded`, `aria-controls`, Escape handling, focus management, scroll containment, and reduced-motion behavior.
- [x] 4.4 Add homepage video pause or play control and prevent autoplay when reduced motion is requested; replace `transition-all` with property-specific transitions.
- [x] 4.5 Verify responsive image `sizes`, leading-image priority, lazy loading, media aspect ratios, alternative text, and empty or long-content states across all templates.
- [x] 4.6 Add canonical metadata and representative social images to every new index and detail route, update the sitemap, and exclude retired URLs.
- [x] 4.7 Add permanent redirects for `/works`, `/performance`, and `/contact`, plus a legacy `/works/[slug]` resolver that sends each migrated slug to its canonical route.

## 5. Additive Migration and Rehearsal

- [x] 5.1 Create the additive database migration and an idempotent content-migration command driven by the approved mapping; do not delete or rewrite the old Works records.
- [x] 5.2 Create and verify the required database backup and object manifest, restore the database to a rehearsal target, and record the evidence before any content mutation.
- [x] 5.3 Run the schema and content migration against the rehearsal database and compare counts, slugs, media IDs, rich text, credits, featured order, and relationships with the approved map.
- [x] 5.4 Test every migrated canonical URL and legacy redirect, including unresolved or unpublished cases, and confirm that old R2 object URLs still work.
- [x] 5.5 Exercise project creation, editing, drafts, publishing, relationship editing, homepage selection, Dance editing, About contact display, and CV replacement through the Payload admin.

## 6. Verification and Launch

- [x] 6.1 Run formatting checks, Oxlint, TypeScript, unit and integration tests, Payload generation checks, and the production build for `apps/claire`.
- [ ] 6.2 Verify desktop and narrow-mobile layouts in a browser, including keyboard-only navigation, visible focus, reduced motion, video controls, console output, readable hero navigation, and no horizontal overflow.
- [x] 6.3 Run a link, metadata, sitemap, image-quality, and accessibility pass over the homepage and every new template with representative sparse and full content.
- [x] 6.4 Create a fresh verified production database backup and object manifest immediately before the approved production migration.
- [x] 6.5 Apply the production migration and deployment, then smoke-test the homepage, all indexes, every migrated detail page, representative redirects, media playback, About contact details, Dance, CV view and download, and Payload admin editing.
- [x] 6.6 Retain the old Works data and rollback-ready application version, record production parity evidence, and roll back the deployment if any launch gate fails.
