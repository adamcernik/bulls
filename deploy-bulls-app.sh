#!/bin/bash

# Display information about the deployment process
echo "=== Bulls Application Deployment Script ==="
echo "This script will build and deploy your Bulls application (from bulls-app folder) to Firebase."
echo

# Change to the bulls-app directory
echo "Changing to bulls-app directory..."
cd bulls-app
if [ $? -ne 0 ]; then
  echo "Error: Could not change to bulls-app directory. Please make sure it exists."
  exit 1
fi
echo "Now in directory: $(pwd)"
echo

# Build the React application
echo "Step 1: Building the React application..."
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Build failed. Please fix the errors and try again."
  exit 1
fi
echo "Build completed successfully!"
echo

# Deploy to Firebase
echo "Step 2: Deploying to Firebase..."
echo "You'll need to log in to Firebase in the browser when prompted."
echo

# Use the locally installed Firebase tools
echo "Running: firebase deploy --only hosting"
echo "Note: You might need to authenticate in the browser window that opens."

# Try to run using the local installation
if [ -f "node_modules/.bin/firebase" ]; then
  node_modules/.bin/firebase deploy --only hosting
else
  # Fall back to npx
  npx firebase deploy --only hosting
fi

if [ $? -ne 0 ]; then
  echo
  echo "Deployment failed. Here are some troubleshooting steps:"
  echo "1. Make sure you've logged in to Firebase: 'npx firebase login'"
  echo "2. Verify your Firebase project is correctly set up in .firebaserc"
  echo "3. Check your internet connection"
  echo "4. Try deploying manually: 'firebase deploy --only hosting'"
  exit 1
fi

echo
echo "Deployment completed! Your app should be available at:"
echo "https://bulls-6db5a.web.app" 