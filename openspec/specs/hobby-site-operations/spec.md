# hobby-site-operations Specification

## Purpose

Keeps routine maintenance understandable for one person through short runbooks, stable dependencies, least-privilege secrets, and explicit manual checkpoints.

## Requirements

### Requirement: One operations guide is authoritative
The monorepo SHALL contain one concise operations index linking setup, deploy, environment, backup, restore, media, migration, rollback, provider ownership, cost, and incident procedures. Template instructions and references to retired Go, PostgreSQL development containers, Neon, Kubernetes, AWS, OpenTofu, GHCR, or separate-repository workflows MUST be removed.

#### Scenario: Maintainer performs an unfamiliar operation
- **WHEN** the maintainer starts from the root README
- **THEN** the maintainer can locate the authoritative procedure, required provider, prerequisites, verification, and rollback steps without consulting a retired repository

### Requirement: Secrets are provider-managed and revocable
Production secrets SHALL live in the relevant provider environment store and MUST NOT be newly written into source, documentation, build output, or backup reports. Credentials belonging to Neon, AWS, or other providers removed by this rollout MUST be revoked with those resources. Rotating surviving Vercel or Cloudflare credentials is optional unless a current live value is found in committed monorepo content.

#### Scenario: Secret scan runs after migration
- **WHEN** the active monorepo and retained migration reports are scanned
- **THEN** no new live credential or provider token is found and the retirement checklist identifies credentials revoked with removed providers

### Requirement: Dependency policy favors stable uniform versions
Both applications SHALL use the same compatible stable versions of their shared runtime and CMS stack, with exact versions for coupled Payload packages and no framework canary release. A single lockfile and automated checks MUST detect drift, vulnerable packages, failed type generation, lint errors, test failures, and build failures.

#### Scenario: A shared framework dependency is upgraded
- **WHEN** Next.js, React, Payload, TypeScript, or the active Node release changes
- **THEN** both applications are checked together and generated artifacts are updated in the same reviewed change

### Requirement: Manual provider changes are recorded, not automated
Provider dashboard or CLI changes SHALL follow a short checklist that records the resource, reason, previous value, new value, verification, rollback, date, and operator without recording secrets. This includes Turso databases, branches, tokens, plan usage, and recovery operations. The repository MUST NOT introduce Terraform, OpenTofu, Pulumi, Kubernetes manifests, or an equivalent desired-state system for these sites.

#### Scenario: DNS or environment configuration changes
- **WHEN** the operator changes a domain, environment variable, database limit, bucket policy, or credential
- **THEN** the operations log records enough non-secret information to verify and reverse the change

### Requirement: Production images are not built or published
Vercel SHALL build both applications directly from their application roots. CI SHALL check source artifacts and MUST NOT build or publish production Docker images or require GHCR for deployment. Routine setup, development, testing, backup, and restore MUST NOT require a long-running container; a documented disposable container MAY be used only as a one-off compatibility or restore-verification tool.

#### Scenario: Main branch is updated
- **WHEN** a checked commit reaches the main branch
- **THEN** Vercel performs the application deployments without consuming a repository-published container image

### Requirement: Cost and stale-resource review is repeatable
The operations guide SHALL define a quarterly review of Vercel usage, Turso storage/read/write/sync quotas, databases/branches/tokens/recovery windows, Cloudflare R2 storage/operations, domains, credentials, backup retention, and unused resources, with a recorded decision for anything that continues to incur cost.

#### Scenario: Quarterly review finds an unused cloud branch or credential
- **WHEN** a resource has no documented current consumer
- **THEN** it is backed up if it can contain data and then removed or explicitly retained with an owner and next review date
