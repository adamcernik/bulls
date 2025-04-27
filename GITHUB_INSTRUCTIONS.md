# GitHub Repository Setup Instructions

Follow these steps to create a new GitHub repository and push your code:

## 1. Create a new repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner, then select "New repository"
3. Set the repository name to "bulls"
4. Add a description: "Bulls Bikes Inventory Management App"
5. Leave it as a Public repository
6. Do NOT initialize with a README, .gitignore, or license (since we already have these)
7. Click "Create repository"

## 2. Connect your local repository to GitHub

After creating the repository, GitHub will show instructions. Follow the second option "…or push an existing repository from the command line".

Run these commands in your terminal:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/bulls.git
git push -u origin main
```

## 3. Verify your repository

1. Refresh the GitHub page
2. You should now see all your code on GitHub
3. The README.md will be displayed on the repository's home page

## 4. Deploy the application (optional)

You can deploy your application using GitHub Pages, Firebase Hosting, or another hosting service of your choice.

### Firebase Hosting (recommended)

Since this application already uses Firebase for authentication and database, Firebase Hosting is a natural choice:

1. Make sure Firebase CLI is installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Navigate to the app directory:
   ```bash
   cd bulls-app
   ```

4. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Specify "build" as your public directory
   - Configure as a single-page app
   - Don't overwrite index.html

5. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ``` 