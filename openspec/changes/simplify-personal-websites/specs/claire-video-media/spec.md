## Purpose

Lets Claire upload and publish portfolio video safely from Payload admin while large media travels directly between the browser and object storage.

## ADDED Requirements

### Requirement: Only authenticated editors can upload video
Claire's media workflow SHALL require an authenticated Payload user before issuing upload authorization or creating a video media record. Upload authorization MUST be short lived, limited to one generated object key, and constrained to the allowed content type and maximum size.

#### Scenario: Anonymous visitor requests an upload
- **WHEN** an unauthenticated request asks for video upload authorization or attempts to create a video media record
- **THEN** the request is rejected without issuing credentials or creating an object

### Requirement: Video uploads bypass application body limits
The browser SHALL upload accepted videos directly to the configured media store using the CMS storage adapter's client-upload flow. Video bytes MUST NOT pass through a Vercel function, and secrets used to sign uploads MUST remain server-side.

#### Scenario: Editor uploads a large accepted video
- **WHEN** an authenticated editor uploads an MP4 larger than the application platform's request-body limit and no larger than 500 MiB
- **THEN** the upload completes directly to object storage and a usable Payload media record is created

### Requirement: Video validation is explicit
The media collection SHALL continue accepting the existing image and document types and SHALL accept MP4 video up to 500 MiB. Both upload authorization and media-record creation MUST reject a disallowed MIME type, missing size, oversized file, or filename that cannot be normalized safely.

#### Scenario: Editor selects an invalid video
- **WHEN** a file is not `video/mp4` or exceeds 500 MiB
- **THEN** the editor receives a clear validation error and no publishable media record is created

### Requirement: Upload failures are recoverable
The admin UI SHALL expose upload progress and a clear retryable error. A failed storage upload MUST NOT create an apparently valid media record, and a failed record creation after successful storage upload MUST be detectable and removable by the documented orphan cleanup procedure.

#### Scenario: Network fails during direct upload
- **WHEN** the browser loses connectivity before the object upload completes
- **THEN** the UI reports failure, permits a retry, and no broken media record is published

### Requirement: Published videos have appropriate playback behavior
An editor SHALL be able to select uploaded video for Claire's hero and work content. Hero video MUST require a poster image and render muted, looping, inline, and non-blocking; work video MUST render with user controls. Both contexts SHALL expose a fallback link and preserve the poster when autoplay or video playback is unavailable.

#### Scenario: Browser blocks autoplay
- **WHEN** the hero video cannot autoplay
- **THEN** the configured poster remains visible and the page content remains usable

#### Scenario: Visitor plays a work video
- **WHEN** a work contains an uploaded MP4
- **THEN** the visitor can play, pause, seek, and enter fullscreen using native or accessible controls

### Requirement: Video delivery supports efficient seeking
Published video responses SHALL use the correct MIME type, support byte-range requests, and use a documented cache policy so visitors can seek without downloading the complete file first.

#### Scenario: Browser requests a byte range
- **WHEN** the video player seeks to a later timestamp
- **THEN** the media origin returns a valid partial response for the requested range
