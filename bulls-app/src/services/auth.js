import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { app, auth as importedAuth } from '../firebase';

// Use the auth from firebase.js if available, otherwise initialize it
const auth = importedAuth || getAuth(app);

// Keep track of auth state observers
let authObservers = [];

/**
 * Sign in with Google using popup
 * @returns {Promise<object|null>} User object or null if sign-in fails
 */
export const signInWithGoogle = async () => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    
    // Create provider with specific configuration
    const provider = new GoogleAuthProvider();
    
    // Add scopes
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    
    // Return the user
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Handle common authentication errors
    let errorMessage = 'Authentication failed. Please try again.';
    
    switch (error.code) {
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
        break;
      case 'auth/unauthorized-domain':
        errorMessage = 'This domain is not authorized for OAuth operations.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'This operation is not allowed. Contact support.';
        break;
      case 'auth/api-key-not-valid':
        errorMessage = 'Firebase API key is invalid. Please check configuration.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This user account has been disabled.';
        break;
      default:
        errorMessage = error.message || 'Authentication error occurred.';
    }
    
    window.alert(`Authentication error: ${errorMessage}`);
    return null;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<boolean>} True if sign-out successful
 */
export const signOut = async () => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    window.alert(`Error signing out: ${error.message}`);
    return false;
  }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback Function to call on auth state change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    // Add to our list of observers
    authObservers.push(callback);
    
    // Subscribe to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, 
      // Success callback
      (user) => {
        callback(user);
      },
      // Error callback
      (error) => {
        console.error('Auth state change error:', error);
        callback(null);
      }
    );
    
    // Return function to unsubscribe
    return () => {
      // Remove from our list
      authObservers = authObservers.filter(cb => cb !== callback);
      // Unsubscribe from Firebase
      unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up auth subscription:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};

/**
 * Get the current user
 * @returns {Object|null} Current user or null if not signed in
 */
export const getCurrentUser = () => {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return auth.currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if Firebase Auth is initialized
 * @returns {boolean} True if Firebase Auth is initialized
 */
export const isAuthInitialized = () => {
  return !!auth;
};

export { auth }; 