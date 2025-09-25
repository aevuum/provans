// lib/features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types/index';

export interface CartItem extends Product {
  count: number;
}

interface CartState {
  items: CartItem[];
  giftWrap?: {
    size: 'S' | 'M' | 'L' | null;
  } | null;
}

const initialState: CartState = {
  items: [],
  giftWrap: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        existing.count += 1;
      } else {
        state.items.push({ ...action.payload, count: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    decrementCount: (state, action: PayloadAction<number>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        if (item.count > 1) {
          item.count -= 1;
        } else {
          state.items = state.items.filter(i => i.id !== action.payload);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.giftWrap = null;
    },
    setGiftWrap: (state, action: PayloadAction<{ size: 'S' | 'M' | 'L' | null }>) => {
      if (action.payload.size === null) state.giftWrap = null;
      else state.giftWrap = { size: action.payload.size };
    },
  },
});

export const { addToCart, removeFromCart, clearCart, decrementCount, setGiftWrap } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;