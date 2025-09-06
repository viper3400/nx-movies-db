#!/usr/bin/env bash
set -euo pipefail

# Collect staged files and run Nx lint for affected projects only.

FILES=$(git diff --name-only --cached --relative || true)

if [ -z "${FILES}" ]; then
  echo "pre-commit: no staged files; skipping Nx lint."
  exit 0
fi

# Convert newline-separated file list to comma-separated for Nx --files
CSV=$(echo "$FILES" | tr '\n' ',' | sed 's/,$//')

echo "pre-commit: running Nx lint for affected projects..."
echo "pre-commit: files => ${CSV}"

# Use local Nx via npx so it works across package managers.
npx nx affected -t lint --files="${CSV}"

