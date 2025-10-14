#!/bin/bash

# Deploy using Git - Pull from GitHub and rebuild
# משוך את הקוד האחרון מ-GitHub ובנה בשרת

set -e

echo "🚀 Git-based deployment..."
echo ""

REMOTE_HOST="contabo"
REMOTE_PATH="/home/clickynder/app"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📤 Step 1/4: Pushing latest code to GitHub...${NC}"
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

echo -e "${BLUE}📥 Step 2/5: Pulling code on server...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && git pull origin main"

echo -e "${GREEN}✅ Code pulled${NC}"
echo ""

echo -e "${BLUE}🗃️  Step 3/5: Running database migrations...${NC}"
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

echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

echo -e "${BLUE}🔨 Step 4/5: Building Docker image on server...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml build app"

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

echo -e "${BLUE}🎬 Step 5/5: Restarting application...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d app"

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}🌐 Live at: https://clickynder.com${NC}"

