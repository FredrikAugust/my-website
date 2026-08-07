## Purpose

Protects every website database and media object with verified, restorable backups and a proven PostgreSQL-to-SQLite conversion before migration, cutover, or source retirement can change or remove data.

## ADDED Requirements

### Requirement: Live data scope is discovered before mutation
The migration process SHALL build a timestamped inventory from the live database and object-storage providers, covering every website database engine, database, branch, bucket, prefix, object version where enabled, collection/table count, row count, object count, and byte total. It MUST NOT rely solely on repository configuration or infrastructure state to determine scope.

#### Scenario: Provider contains an undocumented resource
- **WHEN** live discovery finds a website database, branch, bucket, or prefix that is absent from repository configuration
- **THEN** the resource is added to the migration scope and protected by the same backup and verification gates

### Requirement: Backup gate precedes all data mutations
The migration process MUST have a no-clobber, timestamped database dump and complete object copy for every inventoried data source before changing a database, copying over an existing object key, rotating a storage endpoint, or deleting any source. Backup artifacts SHALL be stored outside the repositories in `../personal-websites-migration` and accompanied by a manifest that contains no credentials. Per-file encryption and a second independent copy are not required. Because the owner has frozen all writes, the completed verified snapshot is the authoritative final source baseline and MUST NOT be repeated later unless the freeze is broken.

#### Scenario: A migration step is attempted without a complete backup
- **WHEN** any required dump, object copy, or manifest is missing
- **THEN** the migration stops before mutating database or blob-storage data

### Requirement: Backups are proven restorable
Every source PostgreSQL backup MUST be restored into a disposable PostgreSQL database and checked for schema presence, table counts, and row-count parity. Every destination SQLite database MUST produce both a portable SQL dump and a restorable database copy that pass integrity checks. Every object backup MUST be checked for key, size, and checksum parity against its source, with any provider-specific multipart checksum differences explicitly resolved.

#### Scenario: Restore verification finds a mismatch
- **WHEN** a restored database or copied object inventory differs from its source
- **THEN** the backup is marked invalid and cutover remains blocked until a new verified backup is produced

### Requirement: Cross-engine conversion preserves application data
The PostgreSQL-to-SQLite conversion MUST preserve all published content, drafts, version history, globals, relationships, identifiers needed by relationships, guestbook entries, media metadata, and media object references. Volatile lock, session, migration-history, or cache records MAY be recreated only when each exclusion is documented and cannot remove user-authored content. Administrator identities SHALL be recreated through password reset, and authentication hashes or active sessions MUST NOT be copied to the new engine.

#### Scenario: Converted application is compared with its source
- **WHEN** the restored source and converted destination are evaluated before cutover
- **THEN** collection, global, draft, version, relationship, guestbook, and media-reference counts and representative content hashes match, with only approved volatile exclusions

#### Scenario: Administrator signs in after conversion
- **WHEN** a known CMS administrator completes the forced password-reset flow
- **THEN** the administrator can access the correct site's admin panel and no previous password hash or session remains valid

### Requirement: Destination promotion requires a rehearsal gate
The process SHALL rehearse the complete conversion, migrations, application behavior, backup, restore, and rollback against disposable databases before production provisioning. Turso MUST NOT be promoted when schema generation, data parity, critical queries, authenticated writes, migrations, backup restoration, or performance acceptance fails. Selecting the documented PostgreSQL fallback MUST stop implementation until the owner explicitly approves the failure evidence and revised cost.

#### Scenario: Turso rehearsal fails an acceptance criterion
- **WHEN** any required parity, behavior, restore, migration, or performance check fails
- **THEN** production migration remains blocked and neither Neon nor a fallback provider is changed automatically

### Requirement: Cutover preserves a tested rollback path
The process SHALL record the previous application and database-adapter configuration, convert the frozen verified snapshot once, and validate both public sites and their admin media flows. Source deletion MAY occur in the same session after the production smoke checklist passes and the owner explicitly approves the exact resources. No time-based retention period or later source re-verification is required while the write freeze remains unbroken.

#### Scenario: Production fails before source deletion
- **WHEN** a critical data, upload, or media-serving regression is detected after cutover but before deletion approval
- **THEN** the operator restores the previous configuration without an object or database delta because the write freeze remains active; after deletion, recovery uses the verified local backup

### Requirement: Backup evidence is auditable
Each backup run SHALL produce a human-readable report containing scope, start and completion times, tool versions, dump and object manifests, verification results, storage location, rollback commands, and the approving operator, while excluding secret values from the report.

#### Scenario: Operator evaluates deletion readiness
- **WHEN** an operator considers deleting a source database, bucket, branch, or repository
- **THEN** the operator can determine from one report whether every backup, restore, parity, smoke, and approval condition has passed
