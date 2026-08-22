## Why

Claire's current site presents exhibitions, individual installations, films, and dance performances through one generic Works structure. Reorganizing the portfolio around the way Claire describes her practice will make the site easier to understand, give each project the right editorial fields, and let her add future work without redesigning pages.

## What Changes

- Replace the public navigation with Installations, Exhibitions, Film, Dance, About, and CV. Keep contact details in the footer and About page.
- Keep the current homepage composition and visual treatment, while adapting its featured-project source to the new content model.
- Introduce reusable Payload collections and public templates for installations, exhibitions, and films, with fields tailored to each type.
- Create reciprocal public links between installations and the exhibitions in which they appeared, while storing the relationship once in Payload to avoid mismatched links.
- Replace Performance with a separate Dance section for Claire's professional career, including a showreel, performance footage, and selected stage work.
- Extend About with a portrait, biography, practice statement, and contact details. Extend CV with view and download actions for a full PDF.
- Preserve existing content and search equity with a reviewed content migration, permanent redirects from old Works, Performance, and Contact URLs, updated metadata, and an updated sitemap.
- Apply a cinematic, minimal, exhibition-like design system led by media, restrained typography, clear hierarchy, and predictable navigation. Motion will respect reduced-motion preferences.
- Add accessibility and media-performance acceptance criteria, including visible keyboard focus, a skip link, readable navigation over media, pause or reduced-motion handling for the homepage video, responsive images, and useful empty states.
- **BREAKING**: Editors will manage installations, exhibitions, films, and dance content in separate Payload structures instead of assigning every item a category in the existing Works collection.

## Capabilities

### New Capabilities

- `claire-portfolio-navigation`: Public information architecture, navigation, legacy redirects, homepage continuity, metadata, and sitemap behavior.
- `claire-art-project-catalog`: Reusable installation, exhibition, and film content models and page templates, including installation-exhibition relationships and editorial publishing behavior.
- `claire-artist-profile`: The separate Dance section, About and contact presentation, and CV page with a viewable and downloadable PDF.

### Modified Capabilities

- None. The existing platform, media-delivery, and migration requirements remain in force without changing their contracts.

## Impact

- Affects `apps/claire` routes, navigation, footer, project components, Payload collections and globals, generated Payload types, sitemap, metadata, tests, and database migrations.
- Reuses the existing Next.js, Payload CMS, Turso, R2, and Vercel platform. No new runtime provider or frontend framework is proposed.
- Requires a pre-migration inventory and classification of current Works records, a verified database backup, a migration rehearsal against copied data, redirect tests, and production smoke checks under the existing safe-site-data-migration requirements.
- Keeps existing media objects in place and reuses the current direct-to-R2 upload and video playback behavior.
