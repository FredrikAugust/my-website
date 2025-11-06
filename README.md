# Fredrik's Personal Website

A simple Go web server that serves Fredrik's homepage.

The website is developed partially following the guide from [golang.dk](https://golang.dk/).

## Prerequisites

- **Go** (1.21+) - [Download](https://go.dev/dl/) or `brew install go`
- **Node** (22) - Use `nvm` or similar
- **Docker** - [Download](https://docs.docker.com/get-docker/) or
  `brew install --cask docker`
- **Task** - Task runner for executing common tasks
  - [Installation guide](https://taskfile.dev/installation/)
  - Or via Homebrew: `brew install go-task`
- **`gotestsum`** - Pretty test output for Go
  - Install: `go install gotest.tools/gotestsum@latest`
- **`air`** - Live reload for Go apps
  - Install: `go install github.com/air-verse/air@latest`
- **TailwindCSS** - CSS framework
  - [Download standalone CLI](https://github.com/tailwindlabs/tailwindcss/releases/latest)
  - Or on MacOS ARM64:

    ```bash
    curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
    chmod +x tailwindcss-macos-arm64
    mv tailwindcss-macos-arm64 /usr/local/bin/tailwindcss
    ```

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd website
   ```

2. Copy the example environment file and fill in your secrets:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual database credentials,
   S3 keys, and Resend API key.

   Same goes for the `cms/` directory

3. Install Go and Node dependencies:

   ```bash
   go mod download
   cd cms
   pnpm i
   ```

4. Run the development server and tailwind CLI:

   ```bash
   task dev
   ```

   Starts cms, databases, redis, go dev server, css building.

## Run tests

Tests can be run with `task test` for all tests including integration tests, or
`task test:unit` for just unit tests.

## Available Tasks

Run `task --list` to see all available tasks.
