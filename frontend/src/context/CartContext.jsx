import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.data.cart);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showNotification('Please sign in to add items to your basket', 'error');
      return false;
    }
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(res.data.data.cart);
      showNotification('Item added to your basket');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add item to basket';
      showNotification(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(res.data.data.cart);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update item quantity';
      showNotification(msg, 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      setCart(res.data.data.cart);
      showNotification('Item removed from basket');
    } catch (err) {
      showNotification('Could not remove item', 'error');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      setCart(res.data.data.cart);
      showNotification(res.data.message || 'Coupon applied successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon';
      showNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const totalItemsCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        notification,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 transition-all animate-bounce ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-amber-400 border border-amber-400/30'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
