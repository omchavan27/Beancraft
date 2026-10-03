import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const defaultUser = { id: 0, name: '', email: '', role: '' };

const AuthContext = createContext({
  user: defaultUser,
  token: '',
  login: async () => ({}),
  signup: async () => ({}),
  logout: () => {},
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartTotal: 0,
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('beancraft_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('beancraft_cart', JSON.stringify(cart));
  }, [cart]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/api/auth/signup', { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      return res.data;
    }
    throw new Error(res.data.message || 'Signup failed');
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('beancraft_cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
