#!/bin/bash

# Clickynder Deployment Script
# בונה את ה-Docker image מקומית ומעלה לשרת

set -e  # עצור אם יש שגיאה

echo "🚀 Starting Clickynder deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="clickynder-app"
IMAGE_TAG="latest"
REMOTE_HOST="contabo"
REMOTE_PATH="/home/clickynder/app"
REMOTE_USER="root"

echo -e "${BLUE}📦 Step 1/5: Building Docker image locally...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} . --platform linux/amd64

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

echo -e "${BLUE}💾 Step 2/5: Saving Docker image to file...${NC}"
docker save ${IMAGE_NAME}:${IMAGE_TAG} | gzip > /tmp/${IMAGE_NAME}.tar.gz

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to save image!${NC}"
    exit 1
fi

IMAGE_SIZE=$(du -h /tmp/${IMAGE_NAME}.tar.gz | cut -f1)
echo -e "${GREEN}✅ Image saved (${IMAGE_SIZE})${NC}"
echo ""

echo -e "${BLUE}📤 Step 3/5: Uploading image to server...${NC}"
rsync -avz --progress /tmp/${IMAGE_NAME}.tar.gz ${REMOTE_HOST}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

echo -e "${BLUE}🔄 Step 4/5: Loading image on server...${NC}"
ssh ${REMOTE_HOST} "sudo docker load < /tmp/${IMAGE_NAME}.tar.gz"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to load image on server!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Image loaded on server${NC}"
echo ""

echo -e "${BLUE}🎬 Step 5/5: Restarting application...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d app"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart application!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Cleanup
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -f /tmp/${IMAGE_NAME}.tar.gz
ssh ${REMOTE_HOST} "rm -f /tmp/${IMAGE_NAME}.tar.gz"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}🌐 Your app is live at: https://clickynder.com${NC}"
echo ""
echo "📊 To view logs, run: ssh ${REMOTE_HOST} 'sudo docker logs clickynder_app -f'"

