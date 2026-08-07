#!/usr/bin/env bash

set -Eeuo pipefail

readonly MIGRATION_REPOSITORIES=(
  "/Users/fredrik/Code/github.com/fredrikaugust/my-website"
  "/Users/fredrik/Code/github.com/fredrikaugust/website-claire"
  "/Users/fredrik/Code/github.com/fredrikaugust/personal-cluster"
)

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "required command is missing: $1"
}

canonical_existing_dir() {
  local directory=$1
  [[ -d "$directory" ]] || die "directory does not exist: $directory"
  (cd "$directory" && pwd -P)
}

assert_external_directory() {
  local directory
  directory=$(canonical_existing_dir "$1")

  [[ "$directory" != "/" ]] || die "refusing to use the filesystem root"
  [[ "$directory" != "/tmp" && "$directory" != "/private/tmp" ]] || \
    die "choose a dedicated directory, not the shared temporary root"

  local repository
  for repository in "${MIGRATION_REPOSITORIES[@]}"; do
    case "$directory/" in
      "$repository"/*) die "output must be outside every repository: $directory" ;;
    esac
  done

  printf '%s\n' "$directory"
}

assert_run_directory() {
  local run_directory
  run_directory=$(assert_external_directory "$1")
  [[ -f "$run_directory/run.json" ]] || die "not a migration run directory: $run_directory"
  printf '%s\n' "$run_directory"
}

assert_label() {
  [[ "$1" =~ ^[a-z0-9][a-z0-9._-]*$ ]] || \
    die "labels may contain only lowercase letters, numbers, dots, underscores, and hyphens: $1"
}

assert_new_path() {
  [[ ! -e "$1" && ! -L "$1" ]] || die "refusing to overwrite: $1"
}

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

sha256_text() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

write_checksum() {
  local artifact=$1
  local checksum_file="${artifact}.sha256"
  assert_new_path "$checksum_file"
  umask 077
  printf '%s  %s\n' "$(sha256_file "$artifact")" "$(basename "$artifact")" >"$checksum_file"
}

read_secret_env() {
  local variable=$1
  [[ "$variable" =~ ^[A-Z][A-Z0-9_]*$ ]] || die "invalid environment variable name: $variable"
  local value=${!variable-}
  [[ -n "$value" ]] || die "required environment variable is empty: $variable"
  printf '%s' "$value"
}

new_private_temp_directory() {
  local directory
  directory=$(mktemp -d "${TMPDIR:-/tmp}/personal-websites-migration.XXXXXX")
  chmod 700 "$directory"
  printf '%s\n' "$directory"
}

tool_version() {
  local command=$1
  if command -v "$command" >/dev/null 2>&1; then
    "$command" --version 2>&1 | head -n 1
  else
    printf 'missing'
  fi
}
