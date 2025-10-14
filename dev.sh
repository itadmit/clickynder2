#!/bin/bash

# Kill any process running on port 3000
echo "🔍 Checking for processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Killed existing process on port 3000" || echo "✅ Port 3000 is free"

# Start dev server
echo "🚀 Starting dev server on port 3000..."
npm run dev

