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
   - **Artifact Registry Administrator** (用于创建仓库和推送镜像)
   - **Service Account User** (允许作为服务账号运行操作)

### 1.5 生成密钥
1. 点击刚创建的服务账号。
2. 进入 **Keys** 标签页。
3. 点击 **Add Key** > **Create new key** > **JSON**.
4. 密钥文件将下载到您的电脑上。

## 2. GitHub 配置

### 2.1 添加 Secrets
前往您的 GitHub 仓库页 > **Settings** > **Secrets and variables** > **Actions** > **Secrets** 标签页 > **New repository secret**。

添加以下 Secrets：

| Secret 名称 | 说明 | 值 |
| :--- | :--- | :--- |
| `GCP_PROJECT_ID` | 项目标识 | 您的 Google Cloud 项目 ID |
| `GCP_SA_KEY` | 部署授权 | 您下载的 JSON 密钥文件的完整内容 |
| `OPENAI_API_KEY` | AI 秘钥 | 您的 OpenAI 或兼容服务的 API Key |

### 2.2 添加 Variables
前往您的 GitHub 仓库页 > **Settings** > **Secrets and variables** > **Actions** > **Variables** 标签页 > **New repository variable**。

添加以下 Variables：

| Variable 名称 | 说明 | 默认值/示例 |
| :--- | :--- | :--- |
| `AI_PROVIDER` | AI 服务商 | `openai` 或 `gemini` |
| `OPENAI_BASE_URL` | API 代理地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 使用的模型 | `gpt-4o-mini` |
| `VITE_API_BASE_URL` | 前端访问后端的地址 | 线上后端 API 的完整 URL |

### 2.3 配置手动审批 (GitHub Environments)

为了让部署在执行前需要人工确认：

1. 前往 GitHub 仓库 > **Settings** > **Environments**。
2. 点击 **New environment**，名称填写 `production`。
3. 在 Environment protection rules 下，勾选 **Required reviewers**。
4. 添加您自己或其他需要审批的人员。
5. 点击 **Save protection rules**。

现在，当工作流触发时，它会暂停并等待指定人员批准后才会执行部署步骤。

## 3. 部署

完成上述配置后，任何推送到 `main` 分支且包含 `backend/` 目录更改的提交，都会自动触发部署工作流。工作流将在 `production` 环境请求批准，批准后继续部署。

## 4. 域名配置 (香港区域)

由于 Google Cloud Run 在香港 (asia-east2) 等部分区域**不支持直接的域名映射**功能，您需要配置 **全局外部应用负载均衡器 (Global External Application Load Balancer)** 来绑定自定义域名。

### 步骤概览：

1. **预留 IP 地址**：创建一个静态全局 IP 地址。
2. **创建网络端点组 (NEG)**：将 Cloud Run 服务添加为无服务器网络端点组。
3. **创建负载均衡器**：
   - 前端配置：绑定 IP 地址和 HTTPS 证书。
   - 后端配置：指向 NEG。
4. **配置 DNS**：将域名解析到预留的 IP 地址。

### 详细步骤 (推荐使用 Cloud Shell 命令行):

由于控制台 UI 经常变化且选项可能难以找到，**强烈建议**直接在 Google Cloud Console 右上角点击终端图标打开 **Cloud Shell**，复制并运行以下命令：

1. **设置变量** (请替换为您的真实域名)
   ```bash
   DOMAIN="api.yourdomain.com"
   REGION="asia-east2"
   SERVICE_NAME="corgi-design-backend"
   ```

2. **预留静态 IP 地址**
   ```bash
   gcloud compute addresses create corgi-lb-ip --global
   
   # 查看分配的 IP 地址（请将此 IP 配置到您的 DNS A 记录）
   gcloud compute addresses describe corgi-lb-ip --global --format="get(address)"
   ```

3. **创建无服务器网络端点组 (NEG)**
   ```bash
   gcloud compute network-endpoint-groups create corgi-serverless-neg \
       --region=$REGION \
       --network-endpoint-type=serverless \
       --cloud-run-service=$SERVICE_NAME
   ```

4. **创建负载均衡器组件**
   ```bash
   # 1. 创建后端服务
   gcloud compute backend-services create corgi-backend-service --global
   
   # 2. 将 NEG 添加到后端服务
   gcloud compute backend-services add-backend corgi-backend-service \
       --global \
       --network-endpoint-group=corgi-serverless-neg \
       --network-endpoint-group-region=$REGION
   
   # 3. 创建 URL 映射
   gcloud compute url-maps create corgi-url-map --default-service corgi-backend-service
   
   # 4. 创建托管 SSL 证书
   gcloud compute ssl-certificates create corgi-cert --domains $DOMAIN --global
   
   # 5. 创建 HTTPS 代理
   gcloud compute target-https-proxies create corgi-https-proxy \
       --ssl-certificates=corgi-cert \
       --url-map=corgi-url-map
   
   # 6. 创建转发规则 (将 IP 绑定到 HTTPS 代理)
   gcloud compute forwarding-rules create corgi-forwarding-rule \
       --address=corgi-lb-ip \
       --target-https-proxy=corgi-https-proxy \
       --global \
       --ports=443
   ```

5. **配置 DNS (特别注意 Cloudflare 用户)**
   - 使用步骤 2 中获取的 IP 地址，在您的域名服务商处添加 A 记录。
   - **Cloudflare 用户注意**：添加 A 记录时，请务必**关闭代理状态** (Proxy Status)，将云朵图标设置为**灰色 (DNS Only)**。
     - 如果开启代理（橙色云朵），Google 无法验证您的域名所有权，导致 SSL 证书无法签发。
     - 证书生效（Active）后，您可以尝试重新开启代理并设置为 Full (Strict) 模式，但初始化时建议关闭。
   - 等待 SSL 证书生效（状态变为 ACTIVE），通常需要 15-60 分钟。
   - 您可以使用 `gcloud compute ssl-certificates list` 查看证书状态。
