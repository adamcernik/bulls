// Firebase core imports
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD-yyeIPQh8kSHl3gUroAaPhLneuQ5i9fE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "bulls-6db5a.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "bulls-6db5a",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "bulls-6db5a.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "388356240353",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:388356240353:web:6b21cf05f4fcfd85a7d8a0",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-T4TKKZK9Y0"
};

let app;
let db;
let auth;
let storage;
let analytics;
let initialized = false;

// Initialize Firebase with error handling
const initFirebase = () => {
  try {
    if (!initialized) {
      console.log('Initializing Firebase...');
      
      // Initialize Firebase
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
      
      // Initialize Firestore
      db = getFirestore(app);
      console.log('Firestore initialized');
      
      // Initialize Auth
      auth = getAuth(app);
      console.log('Auth initialized');
      
      // Initialize Storage
      storage = getStorage(app);
      console.log('Storage initialized');
      
      // Initialize Analytics if supported (but don't wait for it)
      isSupported().then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log('Analytics initialized');
        } else {
          console.log('Analytics not supported in this environment');
        }
      }).catch(err => {
        console.warn('Error initializing analytics:', err);
        // Don't fail the entire initialization for analytics
      });
      
      initialized = true;
      console.log('Firebase fully initialized successfully');
      return Promise.resolve();
    } else {
      console.log('Firebase already initialized');
      return Promise.resolve();
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Don't alert here, let the caller handle the error
    return Promise.reject(error);
  }
};

// Initialize on import, but don't block
try {
  initFirebase().catch(error => {
    console.error('Failed to initialize Firebase on import:', error);
    // We will retry in the App component
  });
} catch (error) {
  console.error('Exception during Firebase initialization:', error);
}

// Google Auth helpers
export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      await initFirebase(); // Try to initialize if not already done
      if (!auth) throw new Error('Firebase Auth not initialized');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return initialized;
};

export { app, db, auth, storage, analytics, initFirebase }; 