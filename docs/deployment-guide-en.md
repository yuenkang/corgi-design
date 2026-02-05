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
   - **Artifact Registry Writer** (to push images)
   - **Service Account User** (to allow running operations as the service account)

### 1.5 Generate Key
1. Click on the created Service Account.
2. Go to the **Keys** tab.
3. Click **Add Key** > **Create new key** > **JSON**.
4. The key file will download to your computer.

## 2. GitHub Configuration

### 2.1 Add Secrets
Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.

Add the following Secrets:

| Secret Name | Value |
| :--- | :--- |
| `GCP_PROJECT_ID` | Your Google Cloud Project ID |
| `GCP_SA_KEY` | The full content of your downloaded JSON key file (copy the entire JSON string) |

### 2.2 Configure Manual Approval (GitHub Environments)

To require manual confirmation before deployment:

1. Go to GitHub Repository > **Settings** > **Environments**.
2. Click **New environment**, name it `production`.
3. Under Environment protection rules, check **Required reviewers**.
4. Add yourself or other required approvers.
5. Click **Save protection rules**.

Now, when the workflow triggers, it will pause and wait for approval from the specified reviewers before proceeding with deployment.

## 3. Deployment

Once the configuration above is complete, any push to the `main` branch that includes changes in the `backend/` directory will automatically trigger the deployment workflow. The workflow will request approval in the `production` environment, and proceed with deployment once approved.
