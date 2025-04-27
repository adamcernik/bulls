// Standalone Firebase verification script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, limit } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Using your new Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyD-yyeIPQh8kSHl3gUroAaPhLneuQ5i9fE",
  authDomain: "bulls-6db5a.firebaseapp.com",
  projectId: "bulls-6db5a",
  storageBucket: "bulls-6db5a.firebasestorage.app",
  messagingSenderId: "388356240353",
  appId: "1:388356240353:web:6b21cf05f4fcfd85a7d8a0",
  measurementId: "G-T4TKKZK9Y0"
};

console.log('🔎 FIREBASE CONNECTION DIAGNOSTIC');
console.log('================================');
console.log('Config:', JSON.stringify(firebaseConfig));

// Delay between steps (ms)
const DELAY = 1000;

// Initialize Firebase
console.log('\n📱 Step 1: Initializing Firebase');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
console.log('✅ Firebase initialized');

// Sleep function for better logging visibility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyFirebase() {
  try {
    await sleep(DELAY);
    
    // Step 2: Anonymous Authentication
    console.log('\n🔑 Step 2: Testing Anonymous Authentication');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Successfully signed in anonymously');
    console.log('User ID:', userCredential.user.uid);
    console.log('Is Anonymous:', userCredential.user.isAnonymous);
    
    await sleep(DELAY);
    
    // Step 3: Test Firestore Read
    console.log('\n📖 Step 3: Testing Firestore Read Access');
    const testQuery = query(collection(db, 'test'), limit(1));
    const querySnapshot = await getDocs(testQuery);
    console.log('✅ Successfully read from Firestore');
    console.log('Documents found:', querySnapshot.size);
    
    await sleep(DELAY);
    
    // Step 4: Test Firestore Write
    console.log('\n📝 Step 4: Testing Firestore Write Access');
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Test document from verification script',
      timestamp: new Date().toISOString(),
      uid: userCredential.user.uid
    });
    console.log('✅ Successfully wrote to Firestore');
    console.log('Document ID:', docRef.id);
    
    console.log('\n✅ ALL TESTS PASSED! Firebase is working correctly.');
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide debugging tips
    if (error.code === 'auth/operation-not-allowed') {
      console.error('\n🔧 SOLUTION: Enable Anonymous Authentication in the Firebase Console');
      console.error('1. Go to https://console.firebase.google.com/project/bulls-6db5a/authentication/providers');
      console.error('2. Enable the Anonymous provider');
    } else if (error.code === 'permission-denied') {
      console.error('\n🔧 SOLUTION: Check your Firestore Rules');
      console.error('Current rules should be: allow read, write: if true;');
      console.error('Make sure rules have been published in the Firebase Console');
    } else if (error.message.includes('network')) {
      console.error('\n🔧 SOLUTION: Check your network connection');
      console.error('Ensure you have internet access and no firewall is blocking Firebase');
    }
  }
}

verifyFirebase(); 