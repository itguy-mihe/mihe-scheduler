#!/bin/bash
set -e

echo "🔨 Building MIHE Meeting Scheduler..."

# Build backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r backend/requirements.txt

# Build frontend
echo "⚙️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build complete! Ready for deployment."
echo ""
echo "To start the server locally:"
echo "  cd backend"
echo "  uvicorn main:app --reload --port 8000"
echo ""
echo "Frontend will be served from backend at http://localhost:8000"
