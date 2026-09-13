# Claire Foody design handoff

Implemented on `codex/claire-design-handoff`, based on the deployed portfolio branch
`codex/reorganize-claire-portfolio` at `f50ca90`. The older local `main` does not
contain the current installation, exhibition, film, Dance, and CV features.

The September 10 visual handoff supplies the layout direction. The user's font
choices and subsequent browser feedback override its original proposal:

- Cormorant Garamond Regular for biography and project prose.
- Manrope Regular and Medium for Claire's name, navigation, headings, and metadata.
- All long prose shares one responsive 20–22px scale. Ostrich is no longer loaded.

Fonts are self-hosted in `apps/claire/src/fonts`, with licenses alongside them.
Manrope was obtained through Fontshare; Cormorant Garamond through Google Fonts.

## Layout

The homepage uses the existing Home poster as a static opening image, followed by
four black-background chapters: Installation, Exhibition, Dance, and Film. Each
chapter links to its category. Category images use the first published project
in CMS order; Dance uses its showreel poster, with a stage image as fallback.

Category indexes use alternating image and title pairs, each with one link. A single underline appears beneath the entire
title block on hover or focus, including wrapped titles. The Installation, Film,
and Dance introductory lines match the PDF mockups.
Project pages place the title above the hero, then prose beside project details,
with credits in role/name columns beside the project facts, followed by film,
documentation, and category navigation. Previous and next projects use the same
ordering as the index and wrap within the category. Project hero and gallery
images open an animated spotlight using react-medium-image-zoom.

The Work dropdown supports pointer, touch, and keyboard use. Mobile navigation
expands in document flow with a black background and an X close icon. Mobile
homepage category links include arrows. Contact links to the About page's contact section. The
footer uses equal outer columns around the centered email, stacking with left alignment on mobile. The navigation contains Work, CV, and
Contact; the About portrait aligns with the top of the biography.

The existing CV download remains available when a PDF is configured. Otherwise,
Print / Save PDF uses the browser's print dialog and a print stylesheet.

## Content and verification

No production content, database, or media was changed. The preview uses an
isolated SQLite copy refreshed with the nine public project records and public
media metadata. Biography and structured CV text remain CMS-owned.

Browser checks covered the homepage, all category pages, Dance, About, CV, and
representative project pages at 320 and 1440 pixels. There was no horizontal
overflow, broken image, or video autoplay. Additional checks covered 390-pixel
mobile navigation, a 768-pixel tablet layout, submenu Escape/focus behavior, and
category navigation closing the mobile menu.

The original 13 tests pass, as do lint, TypeScript, formatting, and production
build checks. The build reported a compiler warning without a diagnostic message.
