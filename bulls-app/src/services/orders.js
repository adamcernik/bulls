import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Place a new order in Firestore
 * @param {Object} orderData - The order data
 * @returns {Promise<Object>} The created order with ID
 */
export const placeOrder = async (orderData) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderData.status || 'pending'
    };
    
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderWithTimestamp);
    
    return {
      id: docRef.id,
      ...orderData
    };
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

/**
 * Get all orders from Firestore
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrders = async () => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      });
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

/**
 * Get orders for a specific customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrdersByCustomer = async (email) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!email) throw new Error("Email is required");
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('email', '==', email),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      });
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting customer orders:", error);
    throw error;
  }
};

/**
 * Get a single order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export const getOrderById = async (id) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Order ID is required");
    
    const orderRef = doc(db, 'orders', id);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return null;
    }
    
    return {
      id: orderDoc.id,
      ...orderDoc.data(),
      createdAt: orderDoc.data().createdAt?.toDate?.() || null,
      updatedAt: orderDoc.data().updatedAt?.toDate?.() || null
    };
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

/**
 * Update an order's status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} True if update successful
 */
export const updateOrderStatus = async (id, status) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Order ID is required");
    if (!status) throw new Error("Status is required");
    
    const orderRef = doc(db, 'orders', id);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Update an order
 * @param {string} id - Order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise<boolean>} True if update successful
 */
export const updateOrder = async (id, orderData) => {
  try {
    if (!db) throw new Error("Firebase DB not initialized");
    if (!id) throw new Error("Order ID is required");
    
    const orderRef = doc(db, 'orders', id);
    
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}; 