# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `go run cmd/server/main.go` - Run the server locally (defaults to port 8080, use PORT env var to override)
- `go test ./...` - Run all tests
- `go mod tidy` - Clean up dependencies

### Database
- `docker-compose up -d postgres` - Start PostgreSQL database
- `docker-compose exec postgres psql -U postgres -d mydb` - Connect to database
- Database credentials: user=postgres, password=supersecret, db=mydb

### Docker
- `docker build -t website .` - Build Docker image
- `docker-compose up` - Start full stack with database

## Architecture

This is a Go web application following Clean Architecture principles with three main layers:

### Core Layer (`internal/core/`)
- `entities/view_count.go` - Domain entities (ViewCount)

### Application Layer (`internal/application/`)
- `usecases/view_usecase.go` - Business logic for view counting
- `interfaces/repository.go` - Repository contracts
- `container/container.go` - Dependency injection container

### Infrastructure Layer (`internal/infrastructure/`)
- `database/postgres_repository.go` - PostgreSQL implementation
- `web/handlers.go` - HTTP handlers and routing

### Entry Point
- `cmd/server/main.go` - Application entry point with graceful shutdown

## Database

PostgreSQL with a single `views` table tracking hostname-based view counts. Migrations are in `migrations/` directory and run automatically via Docker Compose volume mount.

## Key Features
- View counting by hostname
- Template-based HTML rendering from `templates/`
- Static file serving from `static/`
- Containerized deployment with GitHub Actions CI/CD