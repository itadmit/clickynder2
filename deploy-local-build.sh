#!/bin/bash

# Deploy with Local Build - Build locally, push to Git, upload image to server
# בונה מקומית, דוחף ל-Git, ומעלה את ה-image מוכן לשרת

set -e

echo "🚀 Clickynder - Local Build & Deploy Pipeline"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
IMAGE_NAME="clickynder-app"
IMAGE_TAG="latest"
REMOTE_HOST="contabo"
REMOTE_PATH="/home/clickynder/app"

# Step 1: Git Commit & Push
echo -e "${BLUE}📝 Step 1/6: Committing and pushing to Git...${NC}"
git add .
COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 2: Build Docker Image Locally
echo -e "${BLUE}🔨 Step 2/6: Building Docker image locally...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 3: Save Image to Tarball
echo -e "${BLUE}💾 Step 3/6: Saving Docker image...${NC}"
docker save ${IMAGE_NAME}:${IMAGE_TAG} | gzip > /tmp/${IMAGE_NAME}.tar.gz

IMAGE_SIZE=$(du -h /tmp/${IMAGE_NAME}.tar.gz | cut -f1)
echo -e "${GREEN}✅ Image saved (${IMAGE_SIZE})${NC}"
echo ""

# Step 4: Upload Image to Server
echo -e "${BLUE}📤 Step 4/6: Uploading image to server...${NC}"
rsync -avz --progress /tmp/${IMAGE_NAME}.tar.gz ${REMOTE_HOST}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

# Step 5: Load Image on Server
echo -e "${BLUE}🔄 Step 5/6: Loading image on server...${NC}"
ssh ${REMOTE_HOST} "sudo docker load < /tmp/${IMAGE_NAME}.tar.gz"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to load image on server!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Image loaded on server${NC}"
echo ""

# Step 6: Pull Git Changes and Run Migrations
echo -e "${BLUE}🎬 Step 6/7: Pulling Git changes and running migrations...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo git pull origin main"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull changes!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git changes pulled${NC}"
echo ""

# Step 7: Run Database Migrations
echo -e "${BLUE}🗃️  Step 7/7: Running database migrations...${NC}"
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

# Step 8: Restart Application
echo -e "${BLUE}♻️  Restarting application...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d app"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart application!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Cleanup
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -f /tmp/${IMAGE_NAME}.tar.gz
ssh ${REMOTE_HOST} "rm -f /tmp/${IMAGE_NAME}.tar.gz"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Completed Successfully! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}🌐 Your app is live at: https://clickynder.com${NC}"
echo ""
echo -e "📊 View logs: ${BLUE}ssh ${REMOTE_HOST} 'sudo docker logs clickynder_app -f'${NC}"
echo -e "📊 Check status: ${BLUE}ssh ${REMOTE_HOST} 'sudo docker ps'${NC}"
echo ""

