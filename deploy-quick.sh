#!/bin/bash

# Quick Deploy - for small changes without full rebuild
# מעלה רק את הקבצים ששונו ועושה restart מהיר

set -e

echo "⚡ Quick Deploy - Uploading changed files only..."
echo ""

REMOTE_HOST="contabo"
REMOTE_PATH="/home/clickynder/app"

# Upload only source files (not node_modules or .next)
echo "📤 Uploading source files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  src/ ${REMOTE_HOST}:${REMOTE_PATH}/src/

rsync -avz prisma/ ${REMOTE_HOST}:${REMOTE_PATH}/prisma/

echo ""
echo "🔄 Rebuilding on server..."
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d --build app"

echo ""
echo "✅ Quick deploy completed!"
echo "🌐 Check: https://clickynder.com"

