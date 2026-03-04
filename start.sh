#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

IMAGE="quay.io/rh-ee-ybeder/discovery-session-tool"
PORT=8080

if command -v node &>/dev/null; then
  if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
  fi
  echo "Starting Discovery Session Tool on http://localhost:8000"
  npx vite --host --port 8000

elif command -v podman &>/dev/null; then
  echo "Node.js not found. Running with Podman..."
  echo "Starting Discovery Session Tool on http://localhost:${PORT}"
  podman run --rm -p "${PORT}:8080" "${IMAGE}"

elif command -v docker &>/dev/null; then
  echo "Node.js not found. Running with Docker..."
  echo "Starting Discovery Session Tool on http://localhost:${PORT}"
  docker run --rm -p "${PORT}:8080" "${IMAGE}"

else
  echo "Error: No runtime found."
  echo "Install one of the following:"
  echo "  - Node.js 18+  (recommended for development)"
  echo "  - Podman        (recommended for deployment)"
  echo "  - Docker"
  exit 1
fi
