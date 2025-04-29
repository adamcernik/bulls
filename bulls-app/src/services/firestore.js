import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

// Get all products from Firestore
export const getProducts = async () => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data
      });
    });
    
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (id) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Product ID is required");
    
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Update a product in Firestore
export const updateProduct = async (id, updatedData) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Product ID is required");
    
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Add a new product to Firestore
export const addProduct = async (productData) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!productData) throw new Error("Product data is required");
    
    const productRef = collection(db, 'products');
    const newProduct = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(productRef, newProduct);
    
    return {
      id: docRef.id,
      ...productData
    };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Delete a product from Firestore
export const deleteProduct = async (id) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Product ID is required");
    
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Check if user has access
export const checkUserAccess = async (email) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!email) return false;
    
    const accessRef = doc(db, 'access', email);
    const accessDoc = await getDoc(accessRef);
    
    if (!accessDoc.exists()) return false;
    
    return accessDoc.data().hasAccess === true;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
};

// Get allowed users
export const getAllowedUsers = async () => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    
    const accessCollection = collection(db, 'access');
    const accessSnapshot = await getDocs(accessCollection);
    
    const users = [];
    accessSnapshot.forEach((doc) => {
      users.push({
        email: doc.id,
        hasAccess: doc.data().hasAccess || false
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error getting allowed users:", error);
    throw error;
  }
};

// Add a user to allowed list
export const addAllowedUser = async (email, hasAccess = false) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!email) throw new Error("Email is required");
    
    const userRef = doc(db, 'access', email);
    await setDoc(userRef, {
      hasAccess,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error adding allowed user:", error);
    throw error;
  }
};

// Set user access
export const setUserAccess = async (email, hasAccess) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!email) throw new Error("Email is required");
    
    const userRef = doc(db, 'access', email);
    await setDoc(userRef, {
      hasAccess,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error setting user access:", error);
    throw error;
  }
}; 