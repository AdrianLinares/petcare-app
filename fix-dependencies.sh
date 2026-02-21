#!/bin/bash

# PetCare App Dependency Fix Script (npm-only)

set -e

echo "🔧 PetCare App - Clean npm reinstall"
echo "===================================="
echo ""

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Install Node.js 20 LTS first."
    exit 1
fi

echo "Using package manager: npm ✅"
echo ""

# Function to install dependencies for a directory
install_deps() {
    local dir=$1
    local name=$2
    
    echo "📦 Installing dependencies for $name..."
    cd "$dir"
    
    # Remove problematic directories/files
    rm -rf node_modules
    rm -f package-lock.json
    
    echo "   Running: npm install"
    npm install --include=dev --no-audit --no-fund
    
    # Lock deterministic state for subsequent installs
    if [ -f package-lock.json ]; then
        echo "   ✅ package-lock.json generated"
    fi
    
    # Verify key packages are installed
    if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
        echo "   ❌ Installation failed for $name"
        return 1
    fi
    
    echo "   ✅ $name dependencies ready"
    echo ""
    
    cd - > /dev/null
}

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Install root dependencies (if any)
echo "📦 Checking root dependencies..."
cd "$ROOT_DIR"
npm install --no-audit --no-fund > /dev/null 2>&1 || true
echo "✅ Root dependencies checked"
echo ""

# Install frontend dependencies
install_deps "$ROOT_DIR/frontend" "Frontend (React/Vite)"

# Install netlify functions dependencies
install_deps "$ROOT_DIR/netlify/functions" "Netlify Functions"

echo "=============================================="
echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev          (starts Netlify Dev via npx)"
echo "2. Run: npm run build        (to build for production)"
echo ""
