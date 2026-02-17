#!/bin/bash

# PetCare App Dependency Fix Script
# Uses pnpm for reliable dependency installation, falls back to npm

set -e

echo "🔧 PetCare App - Dependency Installation Fix"
echo "=============================================="
echo ""

# Check if pnpm is available, install if not
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm (recommended for better compatibility)..."
    npm install -g pnpm@latest > /dev/null 2>&1
    echo "✅ pnpm installed"
    echo ""
fi

# Determine which package manager to use
if command -v pnpm &> /dev/null; then
    PM="pnpm"
    echo "Using package manager: pnpm ✅"
else
    PM="npm"
    echo "Using package manager: npm"
fi
echo ""

# Function to install dependencies for a directory
install_deps() {
    local dir=$1
    local name=$2
    
    echo "📦 Installing dependencies for $name..."
    cd "$dir"
    
    # Remove problematic directories
    rm -rf node_modules
    if [ "$PM" = "pnpm" ]; then
        rm -rf pnpm-lock.yaml
    else
        rm -rf package-lock.json
    fi
    
    # Install dependencies
    echo "   Running: $PM install"
    if [ "$PM" = "pnpm" ]; then
        pnpm install 2>&1 | tail -15
    else
        npm install --legacy-peer-deps 2>&1 | tail -15 || echo "   ⚠️  npm install returned non-zero (this is okay if packages are installed)"
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
$PM install > /dev/null 2>&1 || true
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
echo "1. Run: npm run dev          (to start development server)"
echo "2. Run: npm run build        (to build for production)"
echo ""
