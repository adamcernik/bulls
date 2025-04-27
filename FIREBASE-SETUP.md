# Firebase Setup Instructions

Your Firebase project `bulls-6db5a` has been configured in the application, but you need to complete a few steps in the Firebase Console to make it fully functional.

## 1. Configure Firestore Rules

1. Go to [Firestore Rules](https://console.firebase.google.com/project/bulls-6db5a/firestore/rules)
2. Replace the existing rules with the following:
   ```
   rules_version = '2';
   
   service cloud.firestore {
     match /databases/{database}/documents {
       // TEMPORARY: Allow all access for debugging
       // WARNING: Do not use in production
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click "Publish" to apply the rules

## 2. Enable Anonymous Authentication

1. Go to [Authentication](https://console.firebase.google.com/project/bulls-6db5a/authentication/providers)
2. Click on the "Sign-in method" tab
3. Find "Anonymous" in the list of providers and click on it
4. Toggle the "Enable" switch
5. Click "Save"

## 3. Create Firestore Database (if it doesn't already exist)

1. Go to [Firestore](https://console.firebase.google.com/project/bulls-6db5a/firestore)
2. Click "Create database"
3. Start in production mode
4. Choose a location (us-central1 is recommended for general usage)
5. Click "Enable"

## 4. Test the Application

After completing the steps above, refresh your application at http://localhost:3003 (or whichever port it's running on).

The "Firebase Connection Test" panel should now show:
- Connection Status: Connected
- Authentication Status: Authenticated
- The "Test Write" and "Test Read" buttons should work successfully

## Next Steps

1. Update the Firestore rules for production use
2. Consider adding proper authentication methods beyond Anonymous auth
3. Set up proper data structure in Firestore 