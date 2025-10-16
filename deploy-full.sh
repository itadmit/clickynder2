#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Clickynder Full Deployment Pipeline${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Step 1: Git commit and push
echo -e "${BLUE}📝 Step 1/6: Git Commit & Push${NC}"
echo "Current git status:"
git status --short

read -p "$(echo -e ${YELLOW}Enter commit message \(or press Enter to skip\): ${NC})" COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${YELLOW}⏭️  Skipping git commit${NC}"
else
    echo "Adding all changes..."
    git add .
    
    echo "Committing..."
    git commit -m "$COMMIT_MESSAGE"
    
    echo "Pushing to main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Git push successful${NC}"
    else
        echo -e "${RED}❌ Git push failed${NC}"
        exit 1
    fi
fi
echo ""

# Step 2: Generate Prisma Client
echo -e "${BLUE}🔧 Step 2/6: Generate Prisma Client${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Prisma generate failed${NC}"
    exit 1
fi
echo ""

# Step 3: Run migrations on production database
echo -e "${BLUE}🗄️  Step 3/6: Deploy Database Migrations${NC}"
echo "Deploying migrations to production database..."
DATABASE_URL="postgresql://clickinder:clickinder123@clickynder.com:5432/clickinder?schema=public" npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations deployed${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations may have issues - continuing anyway${NC}"
fi
echo ""

# Step 4: Build Docker image
echo -e "${BLUE}📦 Step 4/6: Build Docker Image${NC}"
docker build -t clickynder-app:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Save and upload image
echo -e "${BLUE}💾 Step 5/6: Save & Upload Image${NC}"
echo "Saving Docker image..."
docker save clickynder-app:latest | gzip > /tmp/clickynder-app.tar.gz

IMAGE_SIZE=$(du -h /tmp/clickynder-app.tar.gz | cut -f1)
echo -e "${GREEN}✅ Image saved (${IMAGE_SIZE})${NC}"

echo "Uploading to server..."
rsync -avz --progress /tmp/clickynder-app.tar.gz contabo:/tmp/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload completed${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi
echo ""

# Step 6: Deploy on server
echo -e "${BLUE}🎬 Step 6/6: Deploy on Server${NC}"
echo "Loading image on server..."
ssh contabo 'sudo docker load < /tmp/clickynder-app.tar.gz'

echo "Restarting services..."
ssh contabo 'cd /home/clickynder/app && sudo docker-compose -f docker-compose.prod.yml up -d'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services restarted${NC}"
else
    echo -e "${RED}❌ Service restart failed${NC}"
    exit 1
fi
echo ""

# Cleanup
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -f /tmp/clickynder-app.tar.gz
ssh contabo "rm -f /tmp/clickynder-app.tar.gz"
echo ""

# Final summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}🌐 Your app is live at: https://clickynder.com${NC}"
echo ""
echo -e "${BLUE}📊 Useful Commands:${NC}"
echo "  • View app logs:    ssh contabo 'sudo docker logs clickynder_app -f'"
echo "  • View worker logs: ssh contabo 'sudo docker logs clickynder_worker -f'"
echo "  • View all logs:    ssh contabo 'sudo docker-compose -f ~/app/docker-compose.prod.yml logs -f'"
echo "  • Restart services: ssh contabo 'cd ~/app && sudo docker-compose -f docker-compose.prod.yml restart'"
echo ""

