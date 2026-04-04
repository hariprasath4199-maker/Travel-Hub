#!/bin/bash
# Start the Travel Hub dev server with all recent changes
cd "$(dirname "$0")/frontend"

echo "🔧 Cleaning up stale caches..."
rm -f ../.git/index.lock 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null

echo "🔧 Pulling latest from GitHub..."
cd ..
git stash 2>/dev/null
git pull origin main 2>/dev/null
git stash pop 2>/dev/null
cd frontend

echo "🚀 Starting dev server on http://localhost:3000 ..."
npx vite --port=3000 --host=0.0.0.0
