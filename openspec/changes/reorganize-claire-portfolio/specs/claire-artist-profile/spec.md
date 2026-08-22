## Purpose

Defines Claire's professional Dance presentation, About and contact information, and a web and PDF version of her CV.

## ADDED Requirements

### Requirement: Dance remains separate from visual-art projects
The Dance section SHALL present Claire's professional dance career independently from installation and exhibition catalogs. It SHALL support an introduction, showreel, performance footage, and selected stage work with title, company or venue, role, date or year, media, description, and credits where available.

#### Scenario: Visitor opens Dance
- **WHEN** a visitor opens the Dance page
- **THEN** the page leads with Claire's dance introduction and showreel, followed by available performance footage and selected stage work

#### Scenario: Visual-art catalog is browsed
- **WHEN** a visitor browses installations or exhibitions
- **THEN** professional stage credits do not appear as visual-art project entries unless Claire has deliberately related a stage work to an art project

### Requirement: About combines biography, practice, and contact
The About page SHALL support a portrait, biography, a concise description of Claire's artistic practice, email, phone, and available social or video links. The footer SHALL continue to provide the primary contact details and external profile links.

#### Scenario: Visitor wants to contact Claire
- **WHEN** a visitor opens About or reaches the footer
- **THEN** the visitor can find the published contact methods without opening a separate Contact page

### Requirement: CV supports web reading and a full PDF
The CV page SHALL retain a clean, readable web CV and SHALL offer distinct actions to view and download the current full PDF. Editors SHALL be able to replace the PDF without changing the page implementation.

#### Scenario: Visitor views the CV PDF
- **WHEN** a visitor activates the view action
- **THEN** the current PDF opens in a browser-viewable resource with a descriptive file label

#### Scenario: Visitor downloads the CV PDF
- **WHEN** a visitor activates the download action
- **THEN** the current PDF is downloaded with a stable, human-readable filename

#### Scenario: No PDF is published
- **WHEN** the CV has structured web content but no current PDF
- **THEN** the web CV remains available and the page does not show broken view or download actions

### Requirement: Profile media and text remain readable across devices
About, Dance, and CV layouts SHALL preserve media aspect ratios, readable line lengths, useful alternative text, and logical heading order from narrow mobile screens through desktop screens.

#### Scenario: Visitor reads the CV on mobile
- **WHEN** the viewport is narrower than the desktop layout
- **THEN** dates, titles, venues, and actions remain readable without horizontal scrolling or clipped text
