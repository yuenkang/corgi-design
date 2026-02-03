# Changelog

All notable changes to Corgi Design will be documented in this file.

## [1.1.0] - 2026-02-03

### Added
- 🤖 **AI 设计分析功能** - 集成 Gemini/OpenAI API 进行智能网页设计分析
- 🐍 **Python 后端** - FastAPI 实现，支持前后端分离架构
- 🔌 **多 AI 服务商支持** - 支持 OpenAI、DeepSeek、Moonshot 等 OpenAI 兼容接口
- 📝 **AI 日志系统** - 独立记录 AI 请求/响应日志，支持配置开关

### Changed
- 📁 **项目结构重构** - 前端代码移至 `frontend/`，后端代码位于 `backend/`
- 🔧 **CI/CD 适配** - GitHub Actions 工作流更新以适配新目录结构

### Technical
- 后端: FastAPI + google-generativeai + httpx
- 前端: React 18 + Vite 5 + Tailwind CSS
- 环境变量配置: `AI_PROVIDER`, `OPENAI_API_KEY`, `AI_LOG_ENABLED`

---

## [1.0.0] - 2026-01-31

### Added
- 🐕 **初始版本发布**
- 🔍 网页结构分析功能
- 📊 页面信息展示（标题、图片数、链接数、标题层级）
- 💡 基础设计建议（SEO、性能）
- 🎨 现代深色主题侧边栏 UI
- ⚡ React + Vite 构建
