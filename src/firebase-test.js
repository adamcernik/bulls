// Simple Firebase test script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Firebase Demo config - using the same one as the main app
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

async function testFirebase() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test write
    const testCollection = collection(db, 'test_collection');
    const docData = { message: 'Test from CLI', timestamp: new Date().toISOString() };
    
    console.log('Writing test document...');
    const docRef = await addDoc(testCollection, docData);
    console.log('Document written with ID:', docRef.id);
    
    // Test read
    console.log('Reading from collection...');
    const querySnapshot = await getDocs(testCollection);
    console.log(`Read ${querySnapshot.docs.length} documents:`);
    
    querySnapshot.docs.forEach((doc, i) => {
      console.log(`- Doc ${i+1}:`, doc.id, doc.data());
    });
    
    console.log('Firebase test completed successfully!');
  } catch (error) {
    console.error('Firebase test failed:', error);
  }
}

testFirebase(); 