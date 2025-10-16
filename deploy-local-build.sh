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
# Force use of BuildKit and desktop-linux context for Docker 28.x
export DOCKER_BUILDKIT=1
docker context use desktop-linux 2>/dev/null || true
docker buildx build --platform linux/amd64 --load -t ${IMAGE_NAME}:${IMAGE_TAG} .

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

# Step 6: Pull Git Changes and Restart
echo -e "${BLUE}🎬 Step 6/6: Pulling Git changes and restarting...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo git pull origin main && sudo docker compose -f docker-compose.prod.yml up -d app"

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

