# 🐕 Corgi Design

AI-Powered Web Design Assistant - Intelligently analyze web page structure and generate design suggestions and optimization plans with one click.

## ✨ Features

- 🤖 **AI Design Analysis** - Integrated with Google Gemini to provide professional design suggestions.
- 🔍 **Smart Analysis** - Automatically analyzes web structure, heading hierarchy, image, and link counts.
- 💡 **Multi-dimensional Suggestions** - Comprehensive optimization for SEO, performance, accessibility, and design specifications.
- 🎨 **Modern UI** - Dark-themed sidebar design that is aesthetically pleasing and non-intrusive.
- ⚡ **Frontend-Backend Separation** - Python backend + React frontend for easy expansion.

## 🛠️ Tech Stack

### Frontend (Chrome Extension)
- **React 18** - User Interface
- **Vite 5** - Build Tool
- **Tailwind CSS** - Styling Framework
- **Chrome Extension Manifest V3** - Latest Extension API

### Backend (Python API)
- **FastAPI** - Web Framework
- **Google Gemini** - AI Analysis Engine
- **Pydantic** - Data Validation

## 📁 Project Structure

```
corgi/
├── frontend/                # Frontend Code (Chrome Extension)
│   ├── src/
│   │   ├── popup/          # Popup Window
│   │   ├── content/        # Content Script (Sidebar)
│   │   ├── background/     # Background Script
│   │   └── services/       # API Services
│   ├── public/
│   ├── dist/               # Build Output
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Backend Code (Python API)
│   ├── main.py             # FastAPI Entry Point
│   ├── services/           # Business Logic
│   ├── models/             # Data Models
│   └── requirements.txt
└── .github/workflows/       # CI/CD
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.10
- Gemini API Key ([Get it here](https://aistudio.google.com/apikey))

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and fill in OPENAI_API_KEY or GEMINI_API_KEY
python main.py
```

### Docker Deployment

```bash
cd backend

# Option 1: Docker Compose (Recommended)
cp .env.example .env
# Edit .env to configure API Key
docker-compose up -d

# Option 2: Docker Run
docker build -t corgi-design-api .
docker run -d -p 8000:8000 \
  -e OPENAI_API_KEY=your_key \
  -e OPENAI_BASE_URL=https://api.openai.com/v1 \
  corgi-design-api

# View logs
docker-compose logs -f

# Redeploy after code updates
docker-compose up -d --build
```

**Development Mode**: Modify `docker-compose.yml` to mount the code directory for hot reloading:

```yaml
volumes:
  - ./logs:/app/logs
  - .:/app  # Mount code directory
```

Then simply restart the container:
```bash
docker-compose restart
```

### Frontend Build

```bash
cd frontend
npm install
npm run build      # Build only
npm run package    # Build and package as ZIP
```

### Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `frontend/dist` directory

## 📖 Usage

1. Ensure the backend service is running at `http://localhost:8000`
2. Open any web page
3. Click the 🐕 Corgi Design icon in the browser toolbar
4. Click "Start Analysis" to view AI design suggestions

## 🔧 Development Commands

| Command | Description |
|------|------|
| `cd backend && python main.py` | Start Backend |
| `cd backend && docker-compose up -d` | Start Backend with Docker |
| `cd frontend && npm run build` | Build Frontend |
| `cd frontend && npm run package` | Build and Package ZIP |
| `cd frontend && npm run dev` | Frontend Development Mode |

## 🔑 Environment Variables

### Backend (backend/.env)

| Variable | Description | Default |
|------|------|--------|
| `AI_PROVIDER` | AI Service Provider (openai/gemini) | openai |
| `OPENAI_API_KEY` | OpenAI Compatible API Key | - |
| `OPENAI_BASE_URL` | API URL | https://api.openai.com/v1 |
| `OPENAI_MODEL` | Model Name | gpt-4o-mini |
| `AI_LOG_ENABLED` | Enable AI Logging | true |

> [!NOTE]
> If you are using GitHub Actions for deployment, make sure to configure the corresponding **Secrets** (for keys) and **Variables** (for other configs) in the repository settings. See [Backend Deployment Guide](docs/deployment-guide-en.md) for details.

### Frontend (frontend/.env)

| Variable | Description | Default |
|------|------|--------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:8000 |

## 📄 License

MIT License
