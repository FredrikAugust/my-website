# Content decisions and gaps

## Recorded decisions

Claire's supplied brief names **Saudade**, **ON REPEAT**, and **Tides & Threads** as exhibitions or larger projects, so the three existing records map to Exhibitions. The existing Film records map to Film. **The Pace**, currently categorized as Performance, maps to the single Dance page as selected stage work. No existing record is discarded.

The homepage remains compositionally unchanged and keeps its current featured order: Saudade, ON REPEAT, then Tides & Threads. This follows Claire's instruction to leave the recently updated homepage as it is for now.

The brief also names the washing machine, vanity, and table as examples of individual installations. They do not exist as separate Works records in the production inventory. They will not be invented from exhibition media during migration. Claire can add them through the new Installation template, then relate them to the appropriate exhibitions.

## Content follow-up

- No current record supplies installation-specific materials or dimensions.
- No existing Installation destination can be linked to an Exhibition until the individual works are created and titled.
- Saudade has no separate thumbnail or video. Its 1920×1080 hero is usable; several alternative texts are vague or contain spelling mistakes.
- ON REPEAT has suitable 2048 px or larger leading media, but no video. Gallery media 49 is also used by Centrifuge and should be checked for accidental inclusion. Several alternative texts are too generic.
- Tides & Threads has no separate thumbnail or video. Gallery media 24 (1153 px wide) and 25 (1561 px wide) are undersized for full-width desktop presentation. Alternative text needs an editorial pass.
- Wish You Were Here has an uploaded video and 1920×1080 poster but no separate hero or thumbnail; the poster can be reused for cards until Claire supplies one.
- Centrifuge has suitable hero, thumbnail, video, poster, and gallery sources. Its stored YouTube URL is not a supported Vimeo fallback, but the uploaded MP4 takes precedence.
- The Pace has a 2048 px hero but no performance footage or showreel. Its alternative text is too generic.
- The Dance global has no showreel or introduction content yet; the existing CV can seed selected career entries without replacing Claire's editorial control.
- The About practice group is effectively empty, while the biography contains practice language that can remain visible.
- The CV has structured web content but no full PDF. Claire still needs to provide the PDF and preferred download filename.
- Site Settings contains working contact details; their values stay redacted in the committed inventory.

## Rehearsal database

The production Turso database was copied using a read-only transaction into ignored local file `apps/claire/data/claire-rehearsal-20260822.db`. The copy contains 32 application tables and 170 rows, including 6 Works and 61 Media records. SQLite integrity and foreign-key checks passed. A portable SQL dump restored into a second local database with matching Works, Media, Home, and Users counts. No production data was changed.
