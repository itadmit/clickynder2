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
echo "🗃️  Running database migrations..."
ssh ${REMOTE_HOST} << 'ENDSSH'
# Get database credentials from .env.production
DB_USER=$(grep DATABASE_URL /home/clickynder/app/.env.production | sed -n 's/.*postgresql:\/\/\([^:]*\):.*/\1/p')
DB_NAME=$(grep DATABASE_URL /home/clickynder/app/.env.production | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Check for new migrations in the prisma/migrations directory
cd /home/clickynder/app
for migration_dir in prisma/migrations/*/; do
    if [ -d "$migration_dir" ]; then
        migration_name=$(basename "$migration_dir")
        migration_file="${migration_dir}migration.sql"
        
        if [ -f "$migration_file" ]; then
            # Check if migration already applied
            already_applied=$(sudo docker exec clickynder_db psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM _prisma_migrations WHERE migration_name = '$migration_name';")
            
            if [ "$already_applied" = "0" ]; then
                echo "Applying migration: $migration_name"
                # Apply the migration
                sudo docker exec -i clickynder_db psql -U "$DB_USER" -d "$DB_NAME" < "$migration_file"
                
                # Record in _prisma_migrations table
                sudo docker exec clickynder_db psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (gen_random_uuid(), '$(sha256sum "$migration_file" | cut -d' ' -f1)', NOW(), '$migration_name', NULL, NULL, NOW(), 1) ON CONFLICT DO NOTHING;"
            fi
        fi
    fi
done
ENDSSH

echo ""
echo "🔄 Rebuilding on server..."
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d --build app"

echo ""
echo "✅ Quick deploy completed!"
echo "🌐 Check: https://clickynder.com"

