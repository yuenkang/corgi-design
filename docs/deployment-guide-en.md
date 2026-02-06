# Backend Deployment Guide

To successfully deploy the backend to Google Cloud Run using the GitHub Actions workflow, you need to configure your Google Cloud project and GitHub repository.

## 1. Google Cloud Setup

### 1.1 Create Project
Ensure you have a Google Cloud Project. Please note your **Project ID**.

### 1.2 Enable APIs
Enable the necessary APIs for your project:
- **Cloud Run API**
- **Artifact Registry API**

### 1.3 Create Artifact Registry Repository
Create a Docker repository in Artifact Registry to store your container images.
- **Format**: Docker
- **Region**: `asia-east2` (Hong Kong)
- **Name**: `corgi-repo` (update the workflow file if using a different name)

Since we use `asia-east2` and `corgi-repo` in the workflow, run the following command to create it:
```bash
gcloud artifacts repositories create corgi-repo --repository-format=docker --location=asia-east2 --description="Docker repository for Corgi Design"
```

### 1.4 Create Service Account
Create a Service Account for GitHub Actions deployment:
1. Go to **IAM & Admin** > **Service Accounts**.
2. Create a new service account (e.g., `github-actions-deploy`).
3. Grant the following roles:
   - **Cloud Run Admin** (to deploy services)
   - **Artifact Registry Administrator** (to create repositories and push images)
   - **Service Account User** (to allow running operations as the service account)

### 1.5 Generate Key
1. Click on the created Service Account.
2. Go to the **Keys** tab.
3. Click **Add Key** > **Create new key** > **JSON**.
4. The key file will download to your computer.

## 2. GitHub Configuration

### 2.1 Add Secrets
Go to your GitHub repository page > **Settings** > **Secrets and variables** > **Actions** > **Secrets** tab > **New repository secret**.

Add the following Secrets:

| Secret Name | Description | Value |
| :--- | :--- | :--- |
| `GCP_PROJECT_ID` | Project ID | Your Google Cloud Project ID |
| `GCP_SA_KEY` | Deployment Auth | The full content of the JSON key file you downloaded |
| `OPENAI_API_KEY` | AI Key | Your OpenAI or compatible service API Key |

### 2.2 Add Variables
Go to your GitHub repository page > **Settings** > **Secrets and variables** > **Actions** > **Variables** tab > **New repository variable**.

Add the following Variables:

| Variable Name | Description | Default Value/Example |
| :--- | :--- | :--- |
| `AI_PROVIDER` | AI Provider | `openai` or `gemini` |
| `OPENAI_BASE_URL` | API Proxy URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model Name | `gpt-4o-mini` |
| `VITE_API_BASE_URL` | Frontend API URL | Full URL of your deployed backend API |

### 2.3 Configure Manual Approval (GitHub Environments)

To require manual confirmation before deployment:

1. Go to GitHub Repository > **Settings** > **Environments**.
2. Click **New environment**, name it `production`.
3. Under Environment protection rules, check **Required reviewers**.
4. Add yourself or other required approvers.
5. Click **Save protection rules**.

Now, when the workflow triggers, it will pause and wait for approval from the specified reviewers before proceeding with deployment.

## 3. Deployment

Once the configuration above is complete, any push to the `main` branch that includes changes in the `backend/` directory will automatically trigger the deployment workflow. The workflow will request approval in the `production` environment, and proceed with deployment once approved.

## 4. Domain Configuration (Hong Kong Region)

Since Google Cloud Run **does not support direct domain mapping** in some regions like Hong Kong (`asia-east2`), you need to configure a **Global External Application Load Balancer** to bind a custom domain.

### Overview:

1. **Reserve IP Address**: Create a static global IP address.
2. **Create Network Endpoint Group (NEG)**: Add the Cloud Run service as a serverless NEG.
3. **Create Load Balancer**:
   - Frontend: Bind IP address and HTTPS certificate.
   - Backend: Point to the NEG.
4. **Configure DNS**: Point your domain to the reserved IP address.

### Detailed Steps (Recommended via Cloud Shell):

Since UI options can change or be hard to find, it is **highly recommended** to use the **Cloud Shell** (terminal icon in the top right of Google Cloud Console) to run the following commands:

1. **Set Variables** (Replace with your actual domain)
   ```bash
   DOMAIN="api.yourdomain.com"
   REGION="asia-east2"
   SERVICE_NAME="corgi-design-backend"
   ```

2. **Reserve Static IP Address**
   ```bash
   gcloud compute addresses create corgi-lb-ip --global
   
   # Get the allocated IP address (Configure this in your DNS A record)
   gcloud compute addresses describe corgi-lb-ip --global --format="get(address)"
   ```

3. **Create Serverless Network Endpoint Group (NEG)**
   ```bash
   gcloud compute network-endpoint-groups create corgi-serverless-neg \
       --region=$REGION \
       --network-endpoint-type=serverless \
       --cloud-run-service=$SERVICE_NAME
   ```

4. **Create Load Balancer Components**
   ```bash
   # 1. Create Backend Service
   gcloud compute backend-services create corgi-backend-service --global
   
   # 2. Add NEG to Backend Service
   gcloud compute backend-services add-backend corgi-backend-service \
       --global \
       --network-endpoint-group=corgi-serverless-neg \
       --network-endpoint-group-region=$REGION
   
   # 3. Create URL Map
   gcloud compute url-maps create corgi-url-map --default-service corgi-backend-service
   
   # 4. Create Managed SSL Certificate
   gcloud compute ssl-certificates create corgi-cert --domains $DOMAIN --global
   
   # 5. Create Target HTTPS Proxy
   gcloud compute target-https-proxies create corgi-https-proxy \
       --ssl-certificates=corgi-cert \
       --url-map=corgi-url-map
   
   # 6. Create Forwarding Rule (Bind IP to HTTPS Proxy)
   gcloud compute forwarding-rules create corgi-forwarding-rule \
       --address=corgi-lb-ip \
       --target-https-proxy=corgi-https-proxy \
       --global \
       --ports=443
   ```

5. **Configure DNS (Attention Cloudflare Users)**
   - Use the IP address obtained in Step 2 and add an A record at your domain registrar.
   - **For Cloudflare Users**: When adding the A record, ensure **Proxy Status is OFF** (Grey cloud icon, DNS Only).
     - If Proxy is On (Orange cloud), Google cannot verify domain ownership, and the SSL certificate will fail to provision.
     - Once the certificate is Active, you can try enabling Proxy with "Full (Strict)" SSL mode, but "DNS Only" is recommended for initial setup.
   - Wait for SSL certificate to become ACTIVE (usually takes 15-60 minutes).
   - You can check certificate status with `gcloud compute ssl-certificates list`.

Once the certificate status turns `ACTIVE`, your service will be accessible via your custom domain.
