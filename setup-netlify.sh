#!/bin/bash

echo "🚀 Setting up PetCare for Netlify Development"
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing globally..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo "📦 Installing serverless function dependencies..."
cd netlify/functions && npm install
cd ../..

echo ""
echo "✅ All dependencies installed!"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from backend/.env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example .env
        echo "✅ Created .env file. Please update it with your database credentials."
    else
        echo "❌ backend/.env.example not found. Please create a .env file manually."
    fi
else
    echo "✅ .env file exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database credentials"
echo "2. Run database migrations: npm run db:setup"
echo "3. Start development server: npm run dev (or: netlify dev)"
echo ""
echo "📖 For detailed deployment instructions, see NETLIFY_DEPLOYMENT.md"
