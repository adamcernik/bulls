# Bulls App Deployment Guide

This guide documents the process for deploying the Bulls application to Firebase Hosting.

## Repository Structure

The Bulls project has the following structure:
- GitHub repository: https://github.com/adamcernik/bulls
- Main application code is in the `bulls-app` directory
- Deployment configuration files are in both the root and the `bulls-app` directory

## Prerequisites

- Firebase CLI installed (locally or globally)
- Firebase account with access to the Bulls project (`bulls-6db5a`)
- GitHub repository cloned locally

## Deployment Methods

You can deploy the Bulls app using any of the following methods:

### Method 1: Manual Deployment

#### 1. Build the Application

First, build the React application:

```bash
# Navigate to the bulls-app directory
cd bulls-app

# Build the React application
npm run build
```

This command creates an optimized production build in the `build` folder.

#### 2. Deploy to Firebase Hosting

After building the app, deploy it to Firebase Hosting:

```bash
# Deploy only the hosting portion
npx firebase deploy --only hosting
```

### Method 2: Deployment Script

For convenience, you can use the deployment script we've created:

```bash
# From the project root
./deploy-bulls-app.sh
```

This script handles both building and deploying the app.

### Method 3: Automated Deployment (GitHub Actions)

We've set up GitHub Actions to automatically deploy the app whenever changes are pushed to the main branch of the repository.

#### How It Works

1. When you push changes to the `main` branch, especially in the `bulls-app` directory, GitHub Actions will:
   - Build the React application
   - Deploy it to Firebase Hosting

2. You can view the deployment status in the "Actions" tab of your GitHub repository.

#### Setting Up GitHub Actions (One-time Setup)

To enable automated deployments, you need to add a Firebase Service Account secret to your GitHub repository:

1. **Generate a Firebase Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/project/bulls-6db5a/settings/serviceaccounts/adminsdk)
   - Navigate to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

2. **Add the Secret to GitHub**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets > Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT_BULLS`
   - Value: Paste the entire content of the JSON file
   - Click "Add secret"

3. The GitHub Actions workflow is already configured in `.github/workflows/firebase-deploy.yml`

## Deployment Configuration

The key configuration files for our Firebase deployment are:

- **firebase.json**: Configures Firebase services including hosting settings and cache control
- **package.json**: Contains the `homepage` field which is set to `https://bulls-6db5a.web.app`
- **.firebaserc**: Specifies the Firebase project ID (`bulls-6db5a`)
- **.github/workflows/firebase-deploy.yml**: Configures automated GitHub deployments

## Important Notes

1. **Routing**: We use HashRouter for client-side routing to ensure proper handling of routes in Firebase Hosting

2. **Cache Control**: Cache headers are configured in `firebase.json` to optimize load times while ensuring fresh content

3. **GitHub Integration**: Source code is hosted on GitHub, and can be automatically deployed to Firebase Hosting

4. **Firebase Console**: You can monitor the deployment and site metrics at:
   https://console.firebase.google.com/project/bulls-6db5a/overview

## Troubleshooting

If you encounter issues during deployment:

1. **Authentication Issues**: Run `firebase login` to authenticate with Firebase

2. **Build Errors**: Check for any error messages during the build process 

3. **Loading Issues**: If the app loads but appears stuck at loading:
   - Check browser console for errors
   - Verify Firebase configuration in `firebase.js`
   - Confirm that all Firebase services are initialized properly

4. **GitHub Actions Issues**:
   - Check the workflow runs in the Actions tab of your GitHub repository
   - Verify that the Firebase service account secret is correctly added
   - Make sure your branch name matches the one in the workflow file

## Deployed Application

The Bulls app is deployed and accessible at: https://bulls-6db5a.web.app 