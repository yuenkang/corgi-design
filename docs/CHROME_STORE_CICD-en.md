# Chrome Web Store CI/CD Configuration Guide

## 📋 Prerequisites

1. **Chrome Developer Account** - Requires a $5 registration fee.
   - Register at: https://chrome.google.com/webstore/devconsole/

2. **First Manual Upload**
   - Upload the extension manually for the first time to get the Extension ID.

## 🔧 Get API Credentials

### Step 1: Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one.
3. Enable **Chrome Web Store API**.
   - Navigate to APIs & Services → Library.
   - Search for "Chrome Web Store API" and enable it.

### Step 2: Create OAuth Credentials

1. Navigate to APIs & Services → Credentials.
2. Click **Create Credentials** → **OAuth client ID**.
3. Select **Desktop app** as the application type.
4. Record the `Client ID` and `Client Secret`.

### Step 3: Get Refresh Token

1. Visit the following URL in your browser (replace YOUR_CLIENT_ID):

```
https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

2. After authorization, you will get an **authorization code**.

3. Use the following command to get the refresh token:

```bash
curl "https://oauth2.googleapis.com/token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTH_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

4. Copy the `refresh_token` from the response.

### Step 4: Get Extension ID

1. Visit [Chrome Developer Console](https://chrome.google.com/webstore/devconsole/).
2. Click **Add new item**.
3. Upload your extension ZIP file (run `npm run build` then package the dist directory).
4. Fill in extension information and save.
5. Copy the **Extension ID** from the URL or extension details.

## 🔐 Configure GitHub Secrets

Add the following Secrets to your GitHub repository:

1. Go to Repository → Settings → Secrets and variables → Actions.
2. Click **New repository secret**.
3. Add the following secrets:

| Secret Name | Description |
|------------|------|
| `CHROME_EXTENSION_ID` | Your Extension ID (32 characters) |
| `CHROME_CLIENT_ID` | OAuth Client ID |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret |
| `CHROME_REFRESH_TOKEN` | OAuth Refresh Token |

## 🚀 Publication Process

### Automatic Publishing (Push Tags)

```bash
# Update version
npm version patch  # or minor / major

# Push tag (will automatically trigger publication)
git push origin --tags
```

### Manual Publishing

1. Go to GitHub Repository → Actions.
2. Select "Build and Publish to Chrome Web Store".
3. Click "Run workflow".

## 📝 Version Management

It is recommended to use Semantic Versioning:

```bash
# Patch version (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor version (new features): 1.0.0 → 1.1.0
npm version minor

# Major version (breaking changes): 1.0.0 → 2.0.0
npm version major
```

Remember to also update the version in `public/manifest.json`!

## ⚠️ Notes

- Chrome Web Store reviews usually take a few hours to a few days.
- Ensure the extension complies with [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/) before publishing.
- The first publication requires filling in complete store information (description, screenshots, etc.).
