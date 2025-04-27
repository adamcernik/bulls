// Firebase verification script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Using the real Firebase config from the app
const firebaseConfig = {
  apiKey: "AIzaSyC9eFWqk3wdLK7jyYWDP09AaA7aKGhatGY",
  authDomain: "bulls-e-bikes.firebaseapp.com",
  projectId: "bulls-e-bikes",
  storageBucket: "bulls-e-bikes.appspot.com",
  messagingSenderId: "165326537998",
  appId: "1:165326537998:web:ad9ad4c175f57d3a9ae08c"
};

// Initialize Firebase
console.log("🔥 Initializing Firebase verification");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function verifyFirebase() {
  console.log("📋 Starting verification process");
  
  try {
    // Step 1: Sign in anonymously
    console.log("\n🔑 Step 1: Signing in anonymously");
    const userCredential = await signInAnonymously(auth);
    console.log("✅ Success! Signed in with UID:", userCredential.user.uid);
    
    // Step 2: Write to test collection
    console.log("\n📝 Step 2: Writing test document");
    const testData = {
      message: "Test document from verification script",
      timestamp: new Date().toISOString(),
      uid: userCredential.user.uid
    };
    
    const testRef = await addDoc(collection(db, "test_collection"), testData);
    console.log("✅ Success! Document written with ID:", testRef.id);
    
    // Step 3: Read from test collection
    console.log("\n📖 Step 3: Reading from test collection");
    const snapshot = await getDocs(collection(db, "test_collection"));
    console.log(`✅ Success! Read ${snapshot.docs.length} documents`);
    
    if (snapshot.docs.length > 0) {
      console.log("Sample document:", snapshot.docs[0].id);
      console.log(snapshot.docs[0].data());
    }
    
    // Step 4: Create a product
    console.log("\n🚲 Step 4: Creating a test product");
    const productData = {
      model: "Test E-Bike Model",
      category: "Test",
      price: 1999,
      battery: "Test Battery",
      motor: "Test Motor",
      range: "100km",
      weight: 20,
      description: "Test product from verification script",
      createdAt: new Date().toISOString(),
      createdBy: userCredential.user.uid
    };
    
    const productRef = await addDoc(collection(db, "products"), productData);
    console.log("✅ Success! Product created with ID:", productRef.id);
    
    console.log("\n🎉 VERIFICATION COMPLETE: Firebase is working correctly!");
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
}

verifyFirebase(); 