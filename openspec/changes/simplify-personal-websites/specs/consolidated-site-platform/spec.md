## Purpose

Defines a small, cost-bounded managed platform for both sites that removes paid Neon compute, AWS, and infrastructure-as-code without sacrificing data isolation or safe deployments.

## ADDED Requirements

### Requirement: The production platform has a fixed small provider set
The production websites SHALL use Vercel for application hosting, one isolated Turso libSQL database per website, and Cloudflare for DNS and R2 media storage. Website operation MUST NOT depend on Neon, AWS, Kubernetes, GHCR images, a continuously running database server, or an infrastructure-as-code repository.

#### Scenario: Platform inventory is reviewed
- **WHEN** the migration is complete
- **THEN** every required production resource belongs to Vercel, Turso, or Cloudflare and no application references a Neon, AWS, or cluster resource

### Requirement: Database usage is cost bounded
Each site SHALL use a separate Turso database and separately revocable full-access token. Combined production database usage MUST fit the Turso Free or Developer plan and the planned database subscription MUST NOT exceed USD 6 per month before tax unless the owner explicitly approves the documented PostgreSQL fallback and revised ceiling. Development SHALL use local SQLite and MUST NOT require a cloud development database.

#### Scenario: Database plan remains within budget
- **WHEN** both sites operate within the measured storage, read, write, and recovery requirements
- **THEN** the selected Turso plan remains within the approved ceiling and no development database incurs cloud cost

### Requirement: Preview deployments cannot mutate production data
Preview deployments MUST use database-scoped read-only Turso tokens or an explicitly created disposable database copy. They SHALL NOT run schema pushes, production migrations, admin writes, or media writes against production.

#### Scenario: Preview code attempts a write
- **WHEN** a preview deployment attempts to create, update, delete, migrate, or upload against production data
- **THEN** the operation is denied without changing production data

### Requirement: Media remains isolated by site
Fredrik and Claire SHALL use separate R2 buckets and separately revocable write credentials, with public media served through site-specific HTTPS hostnames. Credentials for one website MUST NOT grant write access to the other website's bucket.

#### Scenario: Claire's storage credential is compromised
- **WHEN** Claire's credential is used to address Fredrik's bucket
- **THEN** Cloudflare denies the write and Fredrik's media remains unchanged

### Requirement: Database access remains isolated by site
Fredrik and Claire SHALL use separate databases and database-scoped production tokens. A token issued for one website MUST NOT read, write, migrate, branch, restore, or delete the other website's database.

#### Scenario: Claire's database token is used for Fredrik's database
- **WHEN** Claire's application credential is presented to Fredrik's database
- **THEN** the database provider denies access and Fredrik's records remain unchanged

### Requirement: Existing content remains available through cutover
All media referenced by either site's database at cutover MUST resolve successfully from the new media origin with the correct content type, byte length, and cache behavior before the old storage origin is retired.

#### Scenario: A migrated media object is requested
- **WHEN** a public page renders a pre-migration image, document, or video
- **THEN** the browser receives the complete object from the new site-specific media hostname without a broken link

### Requirement: Infrastructure retirement never destroys live resources implicitly
Retiring infrastructure-as-code SHALL detach operational ownership without executing a destroy operation. Deletion of provider resources MUST be a separate, explicit action gated by the completed backup verification, same-session production smoke checks, and human approval of the exact targets; no time-based retention gate is required.

#### Scenario: The infrastructure repository is retired
- **WHEN** its OpenTofu files, state, and remote repository are archived or deleted
- **THEN** the live Vercel, Turso, and Cloudflare resources continue operating unchanged
