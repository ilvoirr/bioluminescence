#!/bin/bash

# BioLuminescence Setup Script
# This script helps set up the BioLuminescence project quickly

echo "🧬 BioLuminescence Setup Script"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd "BioLuminescence Backend"

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv bio_env

# Activate virtual environment
echo "Activating virtual environment..."
source bio_env/bin/activate

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete!"

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd "../BioLuminescence Frontend"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To run the application:"
echo "1. Backend: cd 'BioLuminescence Backend' && source bio_env/bin/activate && python3 app.py"
echo "2. Frontend: cd 'BioLuminescence Frontend' && npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md"
