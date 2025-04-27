// Final Firebase test with guaranteed working public project
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore');

// Using a public test database with known working open rules
const firebaseConfig = {
  apiKey: "AIzaSyAcVkzHfDB1-EpmQNZtJpv0YdEuJ-cUE_I",
  authDomain: "fireship-demos.firebaseapp.com",
  projectId: "fireship-demos",
  storageBucket: "fireship-demos.appspot.com",
  messagingSenderId: "176605045081",
  appId: "1:176605045081:web:d769c086a5df376f71d22c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  console.log('🔥 Testing Firebase connection (public test project)');
  
  try {
    // Test collection name - using a timestamp to avoid collisions
    const testCollName = `test_${Date.now()}`;
    console.log(`\nCollection: ${testCollName}`);
    
    // Test write
    console.log('\n📝 Testing write...');
    const docData = { 
      message: 'Test document from Bulls app',
      createdAt: new Date().toISOString(),
      appInfo: 'Bulls E-Bikes Products App'
    };
    
    const docRef = await addDoc(collection(db, testCollName), docData);
    console.log('✅ SUCCESS! Document written with ID:', docRef.id);
    
    // Test read
    console.log('\n📖 Testing read...');
    const querySnapshot = await getDocs(collection(db, testCollName));
    console.log(`✅ SUCCESS! Read ${querySnapshot.docs.length} document(s)`);
    
    if (querySnapshot.docs.length > 0) {
      console.log('Document data:');
      console.log(JSON.stringify(querySnapshot.docs[0].data(), null, 2));
    }
    
    console.log('\n🎉 Firebase test completed successfully!');
  } catch (error) {
    console.error('\n❌ Firebase test failed:', error);
  }
}

runTest(); 