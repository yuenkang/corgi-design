# 🐕 Corgi Design

AI驱动的网页设计助手 - 智能分析网页结构，一键生成设计建议与优化方案

## ✨ 功能特性

- 🤖 **AI 设计分析** - 接入 Google Gemini，提供专业设计建议
- 🔍 **智能分析** - 自动分析网页结构、标题层级、图片和链接数量
- 💡 **多维度建议** - SEO、性能、可访问性、设计规范全方位优化
- 🎨 **现代UI** - 采用深色主题的侧边栏设计，美观不干扰
- ⚡ **前后端分离** - Python 后端 + React 前端，易于扩展

## 🛠️ 技术栈

### Frontend (Chrome Extension)
- **React 18** - 用户界面
- **Vite 5** - 构建工具
- **Tailwind CSS** - 样式框架
- **Chrome Extension Manifest V3** - 最新扩展API

### Backend (Python API)
- **FastAPI** - Web 框架
- **Google Gemini** - AI 分析引擎
- **Pydantic** - 数据验证

## 📁 项目结构

```
corgi/
├── frontend/                # 前端代码（Chrome扩展）
│   ├── src/
│   │   ├── popup/          # Popup弹窗
│   │   ├── content/        # 内容脚本（侧边栏）
│   │   ├── background/     # 后台脚本
│   │   └── services/       # API服务
│   ├── public/
│   ├── dist/               # 构建输出
│   ├── package.json
│   └── vite.config.js
├── backend/                 # 后端代码（Python API）
│   ├── main.py             # FastAPI 入口
│   ├── services/           # 业务逻辑
│   ├── models/             # 数据模型
│   └── requirements.txt
└── .github/workflows/       # CI/CD
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Python >= 3.10
- Gemini API Key ([获取地址](https://aistudio.google.com/apikey))

### 后端启动

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入 GEMINI_API_KEY
python main.py
```

### 前端构建

```bash
cd frontend
npm install
npm run build
```

### 加载扩展

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `frontend/dist` 目录

## 📖 使用方法

1. 确保后端服务运行在 `http://localhost:8000`
2. 打开任意网页
3. 点击浏览器工具栏中的 🐕 Corgi Design 图标
4. 点击「开始分析」查看 AI 设计建议

## 🔧 开发命令

| 命令 | 说明 |
|------|------|
| `cd backend && python main.py` | 启动后端 |
| `cd frontend && npm run build` | 构建前端 |
| `cd frontend && npm run dev` | 前端开发模式 |

## 📄 许可证

MIT License
