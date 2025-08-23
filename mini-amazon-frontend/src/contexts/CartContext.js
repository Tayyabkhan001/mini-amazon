// src/contexts/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '@/lib/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCartItems(response.data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Show login prompt
      return;
    }

    try {
      const response = await cartAPI.add({
        productId: product.productId,
        quantity,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      });

      setCartItems(prev => [...prev, response.data.cartItem]);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.remove(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await cartAPI.update(productId, { quantity });
      setCartItems(prev => prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // ADD THE clearCart FUNCTION HERE
  const clearCart = () => {
    setCartItems([]);

    // Also clear cart from localStorage if you want persistence
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, token]);

  // ADD clearCart TO THE value OBJECT
  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart, // Make sure this is included
    cartTotal: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};