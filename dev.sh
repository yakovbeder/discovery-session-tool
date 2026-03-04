#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node &>/dev/null; then
  echo "Error: Node.js not found."
  echo "Install it: sudo dnf install -y nodejs"
  echo "Or use ./start.sh to run with Podman/Docker instead."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Discovery Session Tool (dev mode) on http://localhost:8000"
npx vite --host --port 8000
