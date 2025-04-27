// Minimal Firebase test with anonymous auth
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Completely fresh Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyCNNEUkuG5ASn0YmkzRQbJfnIpQJwoUO-8",
  authDomain: "public-test-final-f9eea.firebaseapp.com",
  projectId: "public-test-final-f9eea",
  storageBucket: "public-test-final-f9eea.appspot.com",
  messagingSenderId: "1032789255708", 
  appId: "1:1032789255708:web:5d95eba6c650e285eaacec"
};

// Firebase setup
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function minimalTest() {
  console.log('Starting minimal Firebase test...');
  
  try {
    // Sign in anonymously first
    console.log('Attempting anonymous sign-in...');
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously as:', userCredential.user.uid);
    
    // Wait a moment for auth to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Just try reading any collection
    console.log('Attempting to read from test_data collection...');
    const snapshot = await getDocs(collection(db, 'test_data'));
    
    console.log(`Successfully read ${snapshot.docs.length} documents`);
    console.log('TEST PASSED: Firebase connection works!');
  } catch (error) {
    console.error('TEST FAILED:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

minimalTest(); 