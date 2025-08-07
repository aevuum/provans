'use client';

import { useState, useEffect } from 'react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: { id: string; title: string; price: number; image: string }) => {
    setCartItems(current => {
      const existingItem = current.find(item => item.id === product.id);
      
      if (existingItem) {
        return current.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...current, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(current =>
      current.map(item =>
        item.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    getCartTotal,
    getCartItemsCount,
    clearCart
  };
}
