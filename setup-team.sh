#!/usr/bin/env bash

# OpenShift Discovery Session Tool - Team Setup Script
# This script helps team members quickly set up the tool locally
# Compatible with bash, zsh, and other POSIX shells

set -e  # Exit on any error

echo "🚀 Setting up OpenShift Discovery Session Tool..."
echo ""

# Detect shell for better user experience
SHELL_NAME=$(basename "$SHELL")
echo "📋 Detected shell: $SHELL_NAME"
echo ""

# Check if directory already exists
if [ -d "discovery-session-tool" ]; then
    echo "⚠️  Directory 'discovery-session-tool' already exists!"
    echo "   Do you want to update it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📥 Updating existing repository..."
        cd discovery-session-tool
        git pull origin main
    else
        echo "❌ Setup cancelled. Please remove the existing directory first."
        exit 1
    fi
else
    echo "📥 Cloning repository..."
    git clone https://github.com/yakovbeder/discovery-session-tool.git
    cd discovery-session-tool
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 To start the tool:"
echo "   cd discovery-session-tool"
echo "   python3 server.py"
echo ""
echo "📖 Then open your browser to: http://localhost:8000"
echo ""
echo "💡 Your data will be saved locally and won't conflict with others!"
echo ""
echo "🔄 To update later: git pull origin main"
echo "" 