const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('Starting Firebase upload process...');

// Check for service account file
const serviceAccountPath = path.join(__dirname, '../../serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Service account file not found at ${serviceAccountPath}`);
  console.error('Please place your Firebase service account key file in the root directory of the project');
  process.exit(1);
}

try {
  console.log('Loading Firebase Admin credentials...');
  const serviceAccount = require(serviceAccountPath);

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully');

  const db = admin.firestore();
  const productsCollection = db.collection('products');

  // Path to JSON file
  const jsonFilePath = path.join(__dirname, '../../public/data/products.json');
  
  // Check if JSON file exists
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: Products JSON file not found at ${jsonFilePath}`);
    console.error('Please run excel-to-json.js first to generate the products.json file');
    process.exit(1);
  }

  // Read products from JSON file
  console.log(`Reading products from ${jsonFilePath}`);
  const productsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  console.log(`Loaded ${productsData.length} products from JSON file`);

  // Upload products to Firestore
  async function uploadProducts() {
    console.log('Starting upload to Firestore...');
    
    // Get existing products to avoid duplicates
    const snapshot = await productsCollection.get();
    const existingProducts = new Map();
    
    snapshot.forEach(doc => {
      existingProducts.set(doc.data().model, doc.id);
    });
    
    console.log(`Found ${existingProducts.size} existing products in Firestore`);
    
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    const batch = db.batch();
    const batchSize = 500; // Firestore batch limit is 500
    let currentBatchCount = 0;
    let totalBatchesCommitted = 0;
    
    // Process products in batches
    for (const product of productsData) {
      try {
        if (existingProducts.has(product.model)) {
          // Update existing product
          const docId = existingProducts.get(product.model);
          const docRef = productsCollection.doc(docId);
          batch.update(docRef, product);
          updatedCount++;
        } else {
          // Add new product
          const docRef = productsCollection.doc();
          batch.set(docRef, product);
          addedCount++;
        }
        
        currentBatchCount++;
        
        // Commit batch if it reaches the limit
        if (currentBatchCount >= batchSize) {
          console.log(`Committing batch ${totalBatchesCommitted + 1} (${currentBatchCount} operations)...`);
          await batch.commit();
          console.log(`Batch ${totalBatchesCommitted + 1} committed successfully`);
          
          // Reset batch
          currentBatchCount = 0;
          totalBatchesCommitted++;
        }
      } catch (error) {
        console.error(`Error processing product ${product.model}:`, error);
        errorCount++;
      }
    }
    
    // Commit any remaining operations
    if (currentBatchCount > 0) {
      console.log(`Committing final batch (${currentBatchCount} operations)...`);
      await batch.commit();
      console.log('Final batch committed successfully');
      totalBatchesCommitted++;
    }
    
    console.log('=== Upload Summary ===');
    console.log(`Total products processed: ${productsData.length}`);
    console.log(`New products added: ${addedCount}`);
    console.log(`Existing products updated: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Total batches committed: ${totalBatchesCommitted}`);
    console.log('======================');
    
    console.log('Upload to Firestore completed successfully!');
  }

  // Run the upload
  uploadProducts()
    .then(() => {
      console.log('Process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during upload process:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
} 