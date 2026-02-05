# 后端部署指南

若要使用 GitHub Actions 工作流将后端成功部署到 Google Cloud Run，您需要配置 Google Cloud 项目和 GitHub 仓库。

## 1. Google Cloud 设置

### 1.1 创建项目
确保您拥有一个 Google Cloud 项目。请记下您的 **项目 ID (Project ID)**。

### 1.2 启用 API
为您的项目启用必要的 API：
- **Cloud Run API**
- **Artifact Registry API**

### 1.3 创建 Artifact Registry 仓库
在 Artifact Registry 中创建一个 Docker 仓库以存储您的容器镜像。
- **格式**: Docker
- **区域**: `asia-east2` (香港)
- **名称**: `corgi-repo` (如果您使用其他名称，请更新工作流文件)

由于我们在工作流中使用了 `asia-east2` 和 `corgi-repo`，请运行以下命令创建：
```bash
gcloud artifacts repositories create corgi-repo --repository-format=docker --location=asia-east2 --description="Docker repository for Corgi Design"
```

### 1.4 创建服务账号 (Service Account)
创建一个用于 GitHub Actions 部署的服务账号：
1. 前往 **IAM & Admin** > **Service Accounts**。
2. 创建一个新的服务账号（例如 `github-actions-deploy`）。
3. 授予该账号以下角色：
   - **Cloud Run Admin** (用于部署服务)
   - **Artifact Registry Writer** (用于推送镜像)
   - **Service Account User** (允许作为服务账号运行操作)

### 1.5 生成密钥
1. 点击刚创建的服务账号。
2. 进入 **Keys** 标签页。
3. 点击 **Add Key** > **Create new key** > **JSON**.
4. 密钥文件将下载到您的电脑上。

## 2. GitHub 配置

### 2.1 添加 Secrets
前往您的 GitHub 仓库页 > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**。

添加以下 Secrets：

| Secret 名称 | 值 |
| :--- | :--- |
| `GCP_PROJECT_ID` | 您的 Google Cloud 项目 ID |
| `GCP_SA_KEY` | 您下载的 JSON 密钥文件的完整内容（复制整个 JSON 字符串）|

### 2.2 配置手动审批 (GitHub Environments)

为了让部署在执行前需要人工确认：

1. 前往 GitHub 仓库 > **Settings** > **Environments**。
2. 点击 **New environment**，名称填写 `production`。
3. 在 Environment protection rules 下，勾选 **Required reviewers**。
4. 添加您自己或其他需要审批的人员。
5. 点击 **Save protection rules**。

现在，当工作流触发时，它会暂停并等待指定人员批准后才会执行部署步骤。

## 3. 部署

完成上述配置后，任何推送到 `main` 分支且包含 `backend/` 目录更改的提交，都会自动触发部署工作流。工作流将在 `production` 环境请求批准，批准后继续部署。
