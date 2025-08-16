# AI Meeting Notes Summarizer

An AI-powered application that generates meeting summaries using Groq's fast language models and shares them via email.

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd server
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## ✨ Features

- **AI Summarization**: Generate meeting summaries using Groq's GPT-OSS-120B model
- **File Upload**: Support for TXT and PDF files with intelligent text extraction
- **Custom Prompts**: Tailor AI instructions for specific meeting types
- **Email Sharing**: Send formatted summaries to team members via Gmail
- **Modern UI**: Built with React and Tailwind CSS
- **Real-time Processing**: Fast API responses with FastAPI backend

## 🔑 Required Environment Variables

**Backend** (`.env` in `server/` directory):

- `GROQ_API_KEY` - Your Groq API key
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail app password

**Frontend** (`.env` in `frontend/` directory):

- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:8000)

## 📁 Project Structure

```
├── server/           # FastAPI backend with Groq integration
│   ├── app/
│   │   └── main.py  # Main API endpoints
│   ├── venv/        # Python virtual environment
│   └── requirements.txt
├── frontend/        # React app with Tailwind CSS
│   ├── src/
│   │   └── App.jsx # Main application component
│   └── package.json
├── .gitignore       # Global gitignore rules
└── README.md        # This file
```

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python, Groq SDK, pdfplumber, markdown
- **Frontend**: React, Tailwind CSS, Axios, Vite
- **AI**: Groq (GPT-OSS-120B model)
- **File Processing**: PDF text extraction, markdown formatting
- **Email**: SMTP with Gmail integration

## 🚀 API Endpoints

- `POST /api/summarize` - Generate AI summary from transcript or file
- `POST /api/share` - Share summary via email
