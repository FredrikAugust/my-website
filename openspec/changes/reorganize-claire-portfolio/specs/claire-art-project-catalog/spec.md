## Purpose

Defines reusable editorial structures and public templates for Claire's installations, exhibitions, and independent dance films.

## ADDED Requirements

### Requirement: Installation entries use an installation template
An installation entry SHALL support a title, slug, year, hero image, short description, photos, video, materials, dimensions, credits or collaborators, exhibition history, display order, featured state, and draft or published state. The public template SHALL lead with media and SHALL hide optional sections that have no content.

#### Scenario: Visitor opens a published installation
- **WHEN** a visitor opens a published installation
- **THEN** the page presents its hero and description before supporting media and shows the available physical details, credits, and exhibition history in a consistent layout

#### Scenario: Editor omits optional installation media
- **WHEN** an editor publishes an installation without a gallery or video
- **THEN** the public page omits those empty sections without broken placeholders

### Requirement: Exhibition entries use an exhibition template
An exhibition entry SHALL support a title, slug, overview, venue, city, start and end dates or a display-date label, hero media, installation photos, video, collaborators or credits, included installations, display order, featured state, and draft or published state.

#### Scenario: Visitor opens a published exhibition
- **WHEN** a visitor opens a published exhibition
- **THEN** the page presents its overview, place and dates, available media, credits, and linked list of included installations

### Requirement: Film entries use a film template
A film entry SHALL support a title, slug, year, thumbnail, video, description, credits, display order, featured state, and draft or published state. The page SHALL use the existing supported uploaded-video and Vimeo playback behavior.

#### Scenario: Visitor opens a published film
- **WHEN** a visitor opens a film with valid playback media
- **THEN** the page presents the film's title, year, video, description, and credits in a consistent film layout

### Requirement: Installation and exhibition links stay reciprocal
Editors SHALL record the relationship between an installation and its exhibitions once. The public installation page SHALL list each related exhibition under a clear "Presented in" label, and each public exhibition page SHALL derive and link its included installations from the same relationship.

#### Scenario: Editor adds an installation to an exhibition
- **WHEN** an editor associates an installation with a published exhibition
- **THEN** both public pages link to each other without a second manual relationship entry

#### Scenario: Related item is still a draft
- **WHEN** one side of a relationship is not published
- **THEN** anonymous visitors do not see a link to the unpublished item

### Requirement: Editors can create projects without redesign work
The Payload admin SHALL expose separate, clearly labelled areas for Installations, Exhibitions, and Films. Each content type SHALL generate slugs, validate required media and fields, provide draft and published states, and reuse shared credit and media structures where their meaning matches.

#### Scenario: Editor creates another installation
- **WHEN** an editor completes the required installation fields and publishes the entry
- **THEN** the site adds it to the installation index and renders it with the existing installation template

### Requirement: Existing work is migrated through an approved mapping
Before production migration, the implementation SHALL produce a reviewable mapping from every existing Works record to Installation, Exhibition, Film, Dance, or an explicitly retained unpublished state. The migration SHALL preserve approved titles, slugs, descriptions, media references, credits, and ordering where the destination supports them.

#### Scenario: Existing record has an ambiguous type
- **WHEN** the inventory cannot determine whether a record is an installation or an exhibition
- **THEN** the record remains unmigrated until Claire approves its destination and no production record is discarded

