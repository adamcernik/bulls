#!/bin/bash

# Replace these values with your actual GitHub username and repository name
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="bulls"

# Add the remote repository
echo "Adding remote repository..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push to GitHub
echo "Pushing code to GitHub..."
git push -u origin main

echo "Done! Check your GitHub repository at: https://github.com/$GITHUB_USERNAME/$REPO_NAME" 