// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, getDocs, query, limit } from "firebase/firestore";
import { getAuth, signInAnonymously, connectAuthEmulator, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-yyeIPQh8kSHl3gUroAaPhLneuQ5i9fE",
  authDomain: "bulls-6db5a.firebaseapp.com",
  projectId: "bulls-6db5a",
  storageBucket: "bulls-6db5a.firebasestorage.app",
  messagingSenderId: "388356240353",
  appId: "1:388356240353:web:6b21cf05f4fcfd85a7d8a0",
  measurementId: "G-T4TKKZK9Y0"
};

// Environment variables
const USE_EMULATOR = false; // Set to true to use Firebase emulator
const FORCE_MOCK_MODE = false; // Set to false to use real Firebase data
let useMockData = FORCE_MOCK_MODE;

// Log the environment mode
console.log(`Firebase mode: ${useMockData ? 'MOCK DATA' : 'FIREBASE'}`);
console.log(`Firebase config:`, JSON.stringify(firebaseConfig));

// Initialize Firebase
console.log('Initializing Firebase app...');
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app.name);

// Initialize services
console.log('Initializing Firestore...');
const db = getFirestore(app);
console.log('Firestore initialized');

console.log('Initializing Auth...');
const auth = getAuth(app);
console.log('Auth initialized');

console.log('Initializing Storage...');
const storage = getStorage(app);
console.log('Storage initialized');

// Initialize Analytics (optional, only in browser environment)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    console.log('Initializing Analytics...');
    analytics = getAnalytics(app);
    console.log('Analytics initialized');
  }
} catch (error) {
  console.log('Analytics initialization skipped or failed:', error);
}

// Use emulator if configured (for local development)
if (USE_EMULATOR) {
  console.log('Connecting to Firebase emulators...');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('Using Firebase emulators');
}

// Function to check if Firebase is connected
export const checkFirebaseConnection = async (): Promise<boolean> => {
  if (useMockData) {
    console.log('Using mock data, skipping connection check');
    return true;
  }

  try {
    console.log('Checking Firebase connection...');
    // Try to read a single document from Firestore
    const testCollectionRef = collection(db, 'test');
    const q = query(testCollectionRef, limit(1));
    await getDocs(q);
    console.log('Firebase connection check: SUCCESS');
    return true;
  } catch (error) {
    console.error('Firebase connection check: FAILED', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      // Log additional error properties
      console.error('Error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    return false;
  }
};

// Function to sign in anonymously
export const signInAnonymouslyToFirebase = async () => {
  try {
    console.log('Attempting to sign in anonymously...');
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously to Firebase with UID:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      // Log additional error properties
      console.error('Error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    throw error;
  }
};

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    console.log('Signed in with Google:', result.user.displayName);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Function to sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Set up auth state change listener (now we prefer Google auth over anonymous)
if (!useMockData) {
  console.log('Setting up auth state change listener');
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log('Auth state changed: User is signed in with ID', user.uid);
      console.log('User is anonymous:', user.isAnonymous);
    } else {
      console.log('Auth state changed: User is signed out');
      // We don't automatically sign in anonymously anymore
      // We'll wait for the user to click login
    }
  });
}

// Export for use in other components
export { app, db, auth, useMockData, storage, analytics }; 