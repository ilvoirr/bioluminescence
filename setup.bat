@echo off
REM BioLuminescence Setup Script for Windows
REM This script helps set up the BioLuminescence project quickly

echo 🧬 BioLuminescence Setup Script
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd "BioLuminescence Backend"

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv bio_env

REM Activate virtual environment
echo Activating virtual environment...
call bio_env\Scripts\activate.bat

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

echo ✅ Backend setup complete!

REM Setup Frontend
echo.
echo 🔧 Setting up Frontend...
cd "..\BioLuminescence Frontend"

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

echo ✅ Frontend setup complete!

echo.
echo 🎉 Setup Complete!
echo.
echo To run the application:
echo 1. Backend: cd "BioLuminescence Backend" ^&^& bio_env\Scripts\activate ^&^& python app.py
echo 2. Frontend: cd "BioLuminescence Frontend" ^&^& npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md
pause
