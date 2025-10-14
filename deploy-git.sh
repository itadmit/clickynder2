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

echo -e "${BLUE}📥 Step 2/4: Pulling code on server...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && git pull origin main"

echo -e "${GREEN}✅ Code pulled${NC}"
echo ""

echo -e "${BLUE}🔨 Step 3/4: Building Docker image on server...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml build app"

echo -e "${GREEN}✅ Build completed${NC}"
echo ""

echo -e "${BLUE}🎬 Step 4/4: Restarting application...${NC}"
ssh ${REMOTE_HOST} "cd ${REMOTE_PATH} && sudo docker compose -f docker-compose.prod.yml up -d app"

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}🌐 Live at: https://clickynder.com${NC}"

