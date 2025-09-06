# BioLuminescence - AI Microscopy Analysis Tool

BioLuminescence is an AI-powered microscopy image analysis application that automatically detects and identifies phytoplankton species in microscopy images using deep learning models. Currently trained to recognize 4 specific phytoplankton species commonly found in marine environments.

## Features

- 🧬 **Automated Species Detection**: AI-powered recognition of phytoplankton species in microscopy images
- 📊 **Detailed Analysis**: Provides species counts, confidence scores, and bounding box visualizations
- 📈 **Dashboard**: View and manage your analysis history
- 🎯 **High Accuracy**: Uses Faster R-CNN model trained on phytoplankton datasets
- 💾 **Local Storage**: All analyses are stored locally in your browser

## Supported Species

**Important**: This model is currently trained to detect only **4 phytoplankton species**:

1. **Alexandrium** - A genus of dinoflagellates, some species produce harmful algal blooms
2. **Asterionellopsis glacialis** - A diatom species commonly found in marine environments
3. **Cerataulina** - A centric diatom genus with distinctive horn-like projections
4. **Ceratium** - A genus of dinoflagellates with characteristic horn-like extensions

**Note**: The model will only accurately identify these 4 species. Images containing other organisms may not be correctly classified.

## Prerequisites

Before running BioLuminescence, you need to install the following software on your computer:

### Step-by-Step Installation Guide

#### 1. Install Python 3.11+

**For Windows:**
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Click the big yellow "Download Python 3.11.x" button
3. Run the downloaded installer (.exe file)
4. **IMPORTANT**: Check the box "Add Python to PATH" at the bottom of the installer
5. Click "Install Now"
6. Wait for installation to complete
7. Click "Close"

**For macOS:**
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Click "Download Python 3.11.x for macOS"
3. Run the downloaded .pkg file
4. Follow the installation wizard (click "Continue" through all steps)
5. Click "Install" and enter your password when prompted
6. Click "Close" when done

**For Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**Verify Installation:**
- Open Command Prompt (Windows) or Terminal (macOS/Linux)
- Type: `python3 --version` or `python --version`
- You should see: `Python 3.11.x`

#### 2. Install Node.js 18+

**For Windows:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version (recommended for most users)
3. Run the downloaded installer (.msi file)
4. Follow the installation wizard (accept all defaults)
5. Click "Finish" when done

**For macOS:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version for macOS
3. Run the downloaded .pkg file
4. Follow the installation wizard
5. Click "Install" and enter your password
6. Click "Close" when done

**For Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
- Open Command Prompt (Windows) or Terminal (macOS/Linux)
- Type: `node --version`
- You should see: `v18.x.x` or higher
- Type: `npm --version`
- You should see: `9.x.x` or higher

#### 3. Install Git (Optional - for cloning the repository)

**For Windows:**
1. Go to [git-scm.com](https://git-scm.com/)
2. Click "Download for Windows"
3. Run the downloaded installer
4. Accept all default settings during installation
5. Click "Finish" when done

**For macOS:**
1. Go to [git-scm.com](https://git-scm.com/)
2. Click "Download for Mac"
3. Run the downloaded installer
4. Follow the installation wizard
5. Click "Install" and enter your password

**For Linux (Ubuntu/Debian):**
```bash
sudo apt install git
```

**Verify Installation:**
- Open Command Prompt (Windows) or Terminal (macOS/Linux)
- Type: `git --version`
- You should see: `git version 2.x.x`

## Installation & Setup

### 1. Download the Project

```bash
# Option 1: Clone with Git
git clone <your-repository-url>
cd BioLuminescence

# Option 2: Download ZIP and extract
# Extract the downloaded ZIP file to your desired location
```

### 2. Backend Setup (Flask API)

Navigate to the backend directory and set up the Python environment:

```bash
cd "BioLuminescence Backend"

# Create virtual environment
python3 -m venv bio_env

# Activate virtual environment
# On Windows:
bio_env\Scripts\activate
# On macOS/Linux:
source bio_env/bin/activate

# Install required packages
pip install -r requirements.txt
```

**Note**: The `requirements.txt` file should include all necessary dependencies. If it doesn't exist, install these packages manually:

```bash
pip install flask flask-cors torch torchvision pillow opencv-python albumentations numpy
```

### 3. Frontend Setup (Next.js)

Open a new terminal and navigate to the frontend directory:

```bash
cd "BioLuminescence Frontend"

# Install dependencies
npm install
```

## Running the Application

### 1. Start the Backend Server

In your terminal with the virtual environment activated:

```bash
cd "BioLuminescence Backend"
source bio_env/bin/activate  # On Windows: bio_env\Scripts\activate
python3 app.py
```

You should see output like:
```
Loading model...
Model loaded successfully!
* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:5000
```

### 2. Start the Frontend Server

Open a **new terminal** and run:

```bash
cd "BioLuminescence Frontend"
npm run dev
```

You should see output like:
```
▲ Next.js 15.5.2
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

### 3. Access the Application

Open your web browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health (for testing)

## Usage

1. **Upload Image**: Click "Upload Image" and select a microscopy image file
2. **Analysis**: The AI will process your image and detect species
3. **View Results**: See detected species with bounding boxes and confidence scores
4. **Dashboard**: Access your analysis history from the dashboard

## Troubleshooting

### Common Issues

#### Port 5000 Already in Use (macOS)
If you get "Port 5000 is in use" error:
```bash
# Kill processes using port 5000
lsof -ti:5000 | xargs kill -9
```

Or disable AirPlay Receiver:
- System Preferences → General → AirDrop & Handoff → Turn off AirPlay Receiver

#### Python Module Not Found
If you get "ModuleNotFoundError":
```bash
# Make sure virtual environment is activated
source bio_env/bin/activate  # On Windows: bio_env\Scripts\activate

# Reinstall requirements
pip install -r requirements.txt
```

#### Node.js Dependencies Issues
If frontend won't start:
```bash
cd "BioLuminescence Frontend"
rm -rf node_modules package-lock.json
npm install
```

#### Model Files Missing
Ensure these files are in the `BioLuminescence Backend` directory:
- `mixmodel.pth` (AI model weights)
- `mix_coco.json` (class definitions)

## Project Structure

```
BioLuminescence/
├── BioLuminescence Backend/          # Flask API server
│   ├── app.py                       # Main Flask application
│   ├── mixmodel.pth                 # AI model weights
│   ├── mix_coco.json               # Species class definitions
│   ├── requirements.txt             # Python dependencies
│   ├── bio_env/                    # Python virtual environment
│   ├── uploads/                    # Temporary upload storage
│   └── results/                    # Processed image results
├── BioLuminescence Frontend/        # Next.js web application
│   ├── src/
│   │   ├── app/                    # Next.js app router pages
│   │   ├── components/             # React components
│   │   └── lib/                    # Utility functions
│   ├── public/                     # Static assets
│   ├── package.json                # Node.js dependencies
│   └── next.config.ts              # Next.js configuration
└── README.md                       # This file
```

## API Endpoints

- `POST /upload` - Upload and analyze microscopy image
- `GET /health` - Health check endpoint

## Technology Stack

- **Backend**: Python, Flask, PyTorch, OpenCV
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI Model**: Faster R-CNN for object detection
- **Image Processing**: Albumentations, PIL

## System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **GPU**: Optional (CUDA-compatible for faster processing)
- **OS**: Windows 10+, macOS 10.15+, or Linux

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
- Check the troubleshooting section above
- Create an issue in the repository
- Contact: [your-email@example.com]

---

**Note**: This application requires significant computational resources for AI model inference. Processing times may vary based on your hardware specifications.
