## Purpose

Provides one small development workspace for both personal websites while preserving independent domains, deployments, content models, and failure boundaries.

## ADDED Requirements

### Requirement: One workspace contains both websites
The system SHALL contain Fredrik's and Claire's websites as separate applications in one pnpm workspace with one lockfile, one package-manager version, one runtime version policy, and root commands for installation, checking, building, and local development. Routine local development SHALL use application-local SQLite and media directories without requiring Docker or a background data service.

#### Scenario: Developer sets up both sites
- **WHEN** a developer clones the monorepo and follows the root setup instructions
- **THEN** one dependency installation is sufficient to run either application with isolated local data and no container startup

### Requirement: Applications remain independently deployable
Each website MUST build and deploy as its own Vercel project from its own application root, retain its existing production domain, and avoid deploying when a change affects only the other application and no shared dependency.

#### Scenario: Only Claire's application changes
- **WHEN** a commit changes only Claire's application and no shared package or root dependency
- **THEN** Claire's checks and deployment run while Fredrik's production deployment remains unchanged

### Requirement: Site-specific data and configuration remain isolated
Each application SHALL keep its own Payload configuration, migrations, generated types, database credentials, storage credentials, secrets, and public URL configuration. A deployment or migration for one application MUST NOT modify the other application's schema or media.

#### Scenario: Claire receives a schema migration
- **WHEN** Claire's production migration is executed
- **THEN** only Claire's database is changed and Fredrik's database remains byte-for-byte unaffected by the migration

### Requirement: Shared tooling remains minimal
The workspace SHALL share only configuration and commands that remove real duplication. It MUST NOT require a task orchestrator, shared runtime service, or cross-application package unless both applications consume it and the dependency reduces net maintenance.

#### Scenario: A shared package is proposed
- **WHEN** code exists in only one application or the abstraction would couple releases
- **THEN** the code remains local to that application

### Requirement: Repository retirement is reversible until parity
The previous Claire repository SHALL remain read-only and recoverable until its monorepo deployment passes build, route, content, admin, and production-domain smoke checks and the owner approves same-session retirement.

#### Scenario: Monorepo parity check fails
- **WHEN** any required Claire page, content record, admin action, upload, or domain behavior differs from the previous deployment
- **THEN** repository retirement is blocked and the previous deployment remains available for rollback
