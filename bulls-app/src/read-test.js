// Simple Firebase read test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Current Firebase config from the app
const firebaseConfig = {
  apiKey: "AIzaSyCI0RWHpZL0ToxpuGE8h5nt44d3QxkHFm0",
  authDomain: "test-demo-public-8b7b7.firebaseapp.com",
  projectId: "test-demo-public-8b7b7",
  storageBucket: "test-demo-public-8b7b7.appspot.com",
  messagingSenderId: "218791789913",
  appId: "1:218791789913:web:76c8c1d20a5959e9e7fcea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRead() {
  console.log('Testing Firebase read only...');
  
  try {
    // Try reading from different collections
    const collections = ['products', 'test_collection'];
    
    for (const collName of collections) {
      console.log(`\nTrying to read from '${collName}' collection...`);
      const querySnapshot = await getDocs(collection(db, collName));
      
      console.log(`Success! Read ${querySnapshot.docs.length} documents from '${collName}'`);
      
      if (querySnapshot.docs.length > 0) {
        console.log('First document:');
        console.log(querySnapshot.docs[0].id, querySnapshot.docs[0].data());
      }
    }
    
    console.log('\nFirebase read test completed successfully!');
  } catch (error) {
    console.error('\nFirebase test failed:', error);
  }
}

testRead(); 