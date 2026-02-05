# Changelog

All notable changes to Corgi Design will be documented in this file.

## [1.1.0] - 2026-02-03

### Added
- 🤖 **AI Design Analysis** - Integrated Gemini/OpenAI API for intelligent web design analysis.
- 🐍 **Python Backend** - Implemented with FastAPI, supporting frontend-backend separation architecture.
- 🔌 **Multi-AI Provider Support** - Supports OpenAI, DeepSeek, Moonshot, and other OpenAI-compatible interfaces.
- 📝 **AI Logging System** - Independently records AI request/response logs, with configurable toggle.

### Changed
- 📁 **Project Restructure** - Frontend code moved to `frontend/`, backend code located in `backend/`.
- 🔧 **CI/CD Adaptation** - GitHub Actions workflow updated to adapt to the new directory structure.

### Technical
- Backend: FastAPI + google-generativeai + httpx
- Frontend: React 18 + Vite 5 + Tailwind CSS
- Env Config: `AI_PROVIDER`, `OPENAI_API_KEY`, `AI_LOG_ENABLED`

---

## [1.0.0] - 2026-01-31

### Added
- 🐕 **Initial Release**
- 🔍 Web structure analysis feature.
- 📊 Page info display (headings, image count, link count, heading hierarchy).
- 💡 Basic design suggestions (SEO, Performance).
- 🎨 Modern dark-themed sidebar UI.
- ⚡ React + Vite build.
