# Chrome Web Store CI/CD 配置指南

## 📋 前置要求

1. **Chrome 开发者账号** - 需要支付 $5 注册费
   - 注册地址: https://chrome.google.com/webstore/devconsole/

2. **首次手动上传扩展**
   - 先手动上传一次扩展以获取 Extension ID

## 🔧 获取 API 凭据

### 步骤 1: 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Chrome Web Store API**
   - 导航到 APIs & Services → Library
   - 搜索 "Chrome Web Store API" 并启用

### 步骤 2: 创建 OAuth 凭据

1. 导航到 APIs & Services → Credentials
2. 点击 **Create Credentials** → **OAuth client ID**
3. 选择 **Desktop app** 作为应用类型
4. 记录下 `Client ID` 和 `Client Secret`

### 步骤 3: 获取 Refresh Token

1. 在浏览器中访问以下URL（替换 YOUR_CLIENT_ID）:

```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

2. 授权后，你会获得一个 **authorization code**

3. 使用以下命令获取 refresh token:

```bash
curl "https://oauth2.googleapis.com/token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTH_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

4. 从响应中复制 `refresh_token`

### 步骤 4: 获取 Extension ID

1. 访问 [Chrome 开发者控制台](https://chrome.google.com/webstore/devconsole/)
2. 点击 **Add new item**
3. 上传你的扩展 ZIP 文件（运行 `npm run build` 后打包 dist 目录）
4. 填写扩展信息并保存
5. 从 URL 或扩展详情中复制 **Extension ID**

## 🔐 配置 GitHub Secrets

在你的 GitHub 仓库中添加以下 Secrets:

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 **New repository secret**
3. 添加以下 secrets:

| Secret 名称 | 说明 |
|------------|------|
| `CHROME_EXTENSION_ID` | 你的扩展ID (32位字符) |
| `CHROME_CLIENT_ID` | OAuth Client ID |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret |
| `CHROME_REFRESH_TOKEN` | OAuth Refresh Token |

## 🚀 发布流程

### 自动发布（推送标签）

```bash
# 更新版本号
npm version patch  # 或 minor / major

# 推送标签（会自动触发发布）
git push origin --tags
```

### 手动发布

1. 进入 GitHub 仓库 → Actions
2. 选择 "Build and Publish to Chrome Web Store"
3. 点击 "Run workflow"

## 📝 版本管理

建议使用语义化版本号：

```bash
# 补丁版本 (bug fixes): 1.0.0 → 1.0.1
npm version patch

# 次要版本 (new features): 1.0.0 → 1.1.0
npm version minor

# 主要版本 (breaking changes): 1.0.0 → 2.0.0
npm version major
```

记得同时更新 `public/manifest.json` 中的版本号！

## ⚠️ 注意事项

- Chrome Web Store 审核通常需要几小时到几天
- 发布前确保扩展符合 [Chrome Web Store 政策](https://developer.chrome.com/docs/webstore/program-policies/)
- 第一次发布需要填写完整的商店信息（描述、截图等）
