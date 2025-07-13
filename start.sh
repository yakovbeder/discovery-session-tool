#!/bin/bash

# OpenShift Discovery Session Tool - Startup Script

echo "🚀 Starting OpenShift Discovery Session Tool..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    python3 server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    python server.py
else
    echo "❌ Error: Python is not installed or not in PATH"
    echo "💡 Please install Python 3 and try again"
    exit 1
fi 