// Simple Firebase read test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Same Firebase config as in the app
const firebaseConfig = {
  apiKey: "AIzaSyDKRFHrVPVTvpFRkQp_XheBYC3-zdQ8GyU",
  authDomain: "test-access-all-bef75.firebaseapp.com",
  projectId: "test-access-all-bef75",
  storageBucket: "test-access-all-bef75.appspot.com",
  messagingSenderId: "550411728152",
  appId: "1:550411728152:web:df1a2151cc23f30dc33ced"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRead() {
  console.log('Simple Firebase read test...');
  
  try {
    console.log('Attempting to read from "test" collection...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    
    console.log(`Success! Read ${querySnapshot.docs.length} documents`);
    
    if (querySnapshot.docs.length > 0) {
      console.log('First document:');
      console.log(querySnapshot.docs[0].id, querySnapshot.docs[0].data());
    }
    
    console.log('Firebase read test completed successfully!');
  } catch (error) {
    console.error('Firebase test failed:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
  }
}

testRead(); 