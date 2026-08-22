## Purpose

Defines the public structure and navigation of Claire's portfolio while preserving the current homepage and established links to published work.

## ADDED Requirements

### Requirement: Primary navigation reflects Claire's practices
The site SHALL present the primary navigation in this order: Installations, Exhibitions, Film, Dance, About, and CV. Claire's name or wordmark SHALL link to the homepage, and Contact SHALL NOT appear as a primary navigation item.

#### Scenario: Visitor opens the desktop navigation
- **WHEN** a visitor opens any public page at the desktop breakpoint
- **THEN** the six primary destinations appear in the required order and Claire's name links to the homepage

#### Scenario: Visitor opens the mobile navigation
- **WHEN** a visitor opens the navigation on a narrow viewport
- **THEN** the same six destinations are available in the same order and the menu can be opened, traversed, and closed with a keyboard

### Requirement: Homepage remains recognizable
The change SHALL retain the homepage's current full-viewport monochrome hero, featured-project section, and practice introduction. Editors SHALL be able to feature published installations, exhibitions, or films without changing the homepage layout.

#### Scenario: Existing visitor returns after launch
- **WHEN** the visitor opens the reorganized homepage
- **THEN** the current hero-led composition remains and featured cards link to their new canonical project routes

### Requirement: Legacy public URLs remain useful
The site SHALL permanently redirect replaced public routes to the closest canonical destination. Each legacy `/works/{slug}` URL SHALL resolve to the corresponding installation, exhibition, film, or Dance destination based on the approved content mapping.

#### Scenario: Visitor follows an old project link
- **WHEN** a visitor requests a migrated `/works/{slug}` URL
- **THEN** the site returns a permanent redirect to that project's canonical route without losing the slug

#### Scenario: Visitor follows a retired section link
- **WHEN** a visitor requests `/works`, `/performance`, or `/contact`
- **THEN** the site permanently redirects to the approved replacement route or section anchor

### Requirement: Discovery metadata follows the new structure
Every index and detail page SHALL provide a canonical URL, a useful title and description, and social-sharing metadata derived from its published content. The public sitemap SHALL list the new routes and SHALL NOT list retired routes.

#### Scenario: Search crawler visits an exhibition
- **WHEN** a crawler requests a published exhibition page
- **THEN** the response identifies the exhibition's canonical route and supplies title, description, and representative-image metadata

### Requirement: Navigation and motion are accessible
Public pages SHALL provide a skip link, visible keyboard focus, hierarchical headings, and navigation text with readable contrast over both media and plain backgrounds. Autoplayed decorative motion SHALL offer a pause mechanism or a motion-free presentation and SHALL honor `prefers-reduced-motion`.

#### Scenario: Keyboard visitor navigates a project page
- **WHEN** a visitor uses the keyboard from the top of a project page
- **THEN** focus is visible, the visitor can skip to main content, and the fixed navigation does not obscure the focused target

#### Scenario: Visitor requests reduced motion
- **WHEN** the visitor's device reports `prefers-reduced-motion: reduce`
- **THEN** the homepage hero uses a still presentation and no decorative loop starts automatically

