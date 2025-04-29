import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query, 
  where
} from 'firebase/firestore';
import { db, useMockData } from '../firebase';
import { Product } from '../models/Product';

// Mock data for when Firebase isn't working
const mockProducts: Product[] = [
  {
    id: "mock1",
    model: "Mountain Performance E-Bike",
    category: "Mountain",
    price: 3499,
    battery: "625Wh",
    motor: "Bosch Performance CX",
    range: "120km",
    weight: 22.5,
    description: "A powerful mountain e-bike for all terrain",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "mock2",
    model: "Urban Commuter E-Bike",
    category: "City",
    price: 2299,
    battery: "500Wh",
    motor: "Shimano Steps",
    range: "100km",
    weight: 19.8,
    description: "Comfortable city e-bike for daily commuting",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "mock3",
    model: "Gravel Explorer E-Bike",
    category: "Gravel",
    price: 2899,
    battery: "540Wh",
    motor: "Brose S Mag",
    range: "110km",
    weight: 21.2,
    description: "Versatile e-bike for mixed terrain adventures",
    imageUrl: "",
    createdAt: new Date().toISOString()
  }
];

// Collection reference
const PRODUCTS_COLLECTION = 'products';

// Get all products from Firestore
export const getProducts = async (): Promise<Product[]> => {
  console.log(`Getting products (Mock mode: ${useMockData})`);
  
  if (useMockData) {
    console.log('Using mock products data');
    return [...mockProducts]; // Return a copy of mock data
  }
  
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('No products found in Firestore, using mock data');
      return [...mockProducts];
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Product;
    });
  } catch (error) {
    console.error('Error getting products:', error);
    console.log('Falling back to mock data due to error');
    return [...mockProducts];
  }
};

// Get a single product by ID
export const getProduct = async (productId: string): Promise<Product | null> => {
  console.log(`Getting product with ID: ${productId} (Mock mode: ${useMockData})`);
  
  if (useMockData) {
    const mockProduct = mockProducts.find(p => p.id === productId);
    return mockProduct ? {...mockProduct} : null;
  }
  
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const data = productDoc.data();
      return {
        id: productDoc.id,
        ...data
      } as Product;
    } else {
      console.log(`No product found with ID: ${productId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting product ${productId}:`, error);
    // Check if the product exists in mock data
    const mockProduct = mockProducts.find(p => p.id === productId);
    return mockProduct ? {...mockProduct} : null;
  }
};

// Add a new product to Firestore
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  console.log(`Adding new product (Mock mode: ${useMockData})`);
  
  const productWithMetadata = {
    ...product,
    createdAt: new Date().toISOString()
  };
  
  if (useMockData) {
    // Create a mock ID
    const mockId = `mock${Date.now()}`;
    const newMockProduct = {
      id: mockId,
      ...productWithMetadata
    };
    
    // Add to our mock array
    mockProducts.push(newMockProduct);
    return {...newMockProduct};
  }
  
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productWithMetadata);
    return {
      id: docRef.id,
      ...productWithMetadata
    };
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Create a mock version anyway
    const mockId = `mock${Date.now()}`;
    const newMockProduct = {
      id: mockId,
      ...productWithMetadata
    };
    
    // Add to our mock array
    mockProducts.push(newMockProduct);
    return {...newMockProduct};
  }
};

// Update an existing product
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  console.log(`Updating product with ID: ${productId} (Mock mode: ${useMockData})`, updates);
  
  const updatesWithMetadata = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  if (useMockData) {
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts[index] = {
        ...mockProducts[index],
        ...updatesWithMetadata
      };
    }
    return;
  }
  
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    console.log(`Attempting to update document: ${PRODUCTS_COLLECTION}/${productId}`, updatesWithMetadata);
    
    // First verify the document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Document ${productId} does not exist in ${PRODUCTS_COLLECTION}`);
    }
    
    // Then update the document
    await updateDoc(docRef, updatesWithMetadata);
    console.log(`Document ${productId} successfully updated with:`, updatesWithMetadata);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    
    // Try to update mock data as fallback
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts[index] = {
        ...mockProducts[index],
        ...updatesWithMetadata
      };
      console.log(`Updated mock data for ${productId} as fallback`);
    }
    
    // Re-throw the error to let the component handle it
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  console.log(`Deleting product with ID: ${productId} (Mock mode: ${useMockData})`);
  
  if (useMockData) {
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
    return;
  }
  
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    
    // Try to delete from mock data
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  console.log(`Getting products by category: ${category} (Mock mode: ${useMockData})`);
  
  if (useMockData) {
    return mockProducts
      .filter(p => p.category === category)
      .map(p => ({...p}));
  }
  
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where("category", "==", category));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Fall back to mock data filtered by category
      return mockProducts
        .filter(p => p.category === category)
        .map(p => ({...p}));
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products by category:', error);
    
    // Fall back to mock data filtered by category
    return mockProducts
      .filter(p => p.category === category)
      .map(p => ({...p}));
  }
}; 