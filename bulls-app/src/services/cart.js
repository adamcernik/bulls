// Cart service - manages shopping cart functionality

// Use localStorage to persist cart data
const CART_STORAGE_KEY = 'bulls-cart';

// Get cart from localStorage
export const getCart = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return { items: [], total: 0 };
    
    const parsedCart = JSON.parse(cartData);
    
    // Validate cart structure
    if (!parsedCart || !Array.isArray(parsedCart.items)) {
      return { items: [], total: 0 };
    }
    
    // Ensure all items have valid prices
    const validatedItems = parsedCart.items.map(item => ({
      ...item,
      price: typeof item.price === 'number' ? item.price : 0,
      quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
    }));
    
    // Recalculate total to ensure it's accurate
    const validatedCart = {
      items: validatedItems,
      total: calculateTotal(validatedItems)
    };
    
    return validatedCart;
  } catch (error) {
    console.error('Error getting cart from storage:', error);
    return { items: [], total: 0 };
  }
};

// Save cart to localStorage
const saveCart = (cart) => {
  try {
    // Ensure we have a valid cart object
    if (!cart || !Array.isArray(cart.items)) {
      cart = { items: [], total: 0 };
    }
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Error saving cart to storage:', error);
    return false;
  }
};

// Safely parse price to number
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Calculate cart total
const calculateTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const itemPrice = parsePrice(item.price);
    const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    return total + (itemPrice * quantity);
  }, 0);
};

// Add product to cart
export const addToCart = (product, quantity = 1) => {
  if (!product || !product.id) return false;
  
  const cart = getCart();
  const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new product to cart with validated price
    cart.items.push({
      id: product.id,
      model: product.model || 'Unknown Product',
      price: parsePrice(product.price),
      quantity: quantity
    });
  }
  
  // Update total
  cart.total = calculateTotal(cart.items);
  
  // Save updated cart
  return saveCart(cart);
};

// Update product quantity in cart
export const updateCartItemQuantity = (productId, quantity) => {
  if (!productId || quantity < 1) return false;
  
  const cart = getCart();
  const itemIndex = cart.items.findIndex(item => item.id === productId);
  
  if (itemIndex === -1) return false;
  
  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  
  // Update total
  cart.total = calculateTotal(cart.items);
  
  // Save updated cart
  return saveCart(cart);
};

// Remove product from cart
export const removeFromCart = (productId) => {
  if (!productId) return false;
  
  const cart = getCart();
  
  // Filter out the product
  cart.items = cart.items.filter(item => item.id !== productId);
  
  // Update total
  cart.total = calculateTotal(cart.items);
  
  // Save updated cart
  return saveCart(cart);
};

// Clear cart
export const clearCart = () => {
  const emptyCart = { items: [], total: 0 };
  return saveCart(emptyCart);
};

// Get cart item count
export const getCartItemCount = () => {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + (item.quantity || 1), 0);
};

// Get cart total
export const getCartTotal = () => {
  const cart = getCart();
  return parsePrice(cart.total);
}; 