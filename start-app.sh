#!/bin/bash

echo "Starting LPG Inspection App Backend..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found in backend directory"
    echo "Please create .env file with required environment variables"
    echo "See .env.example for reference"
    exit 1
fi

echo "Starting backend server..."
npm run dev
