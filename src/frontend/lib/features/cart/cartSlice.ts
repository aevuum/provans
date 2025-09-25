// lib/features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types/index';

export interface CartItem extends Product {
  count: number;
}

// CartState was unused; consolidated state type below.

interface GiftWrap {
  size: 'S' | 'M' | 'L' | null;
}

interface CartStateWithGift {
  items: CartItem[];
  giftWrap?: GiftWrap | null;
}

const initialState: CartStateWithGift = {
  items: [],
  giftWrap: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
      addToCart: (state, action: PayloadAction<any>) => {
        // action.payload can be Product or CartItem-like object
        const payload = action.payload || {};
        const existing = state.items.find(item => item.id === payload.id);
        const inc = payload.count && typeof payload.count === 'number' ? payload.count : 1;
        if (existing) {
          existing.count = (existing.count || 0) + inc;
          } else {
            // If product has discount, store originalPrice and set price to discounted value
            const priceRaw = typeof payload.price === 'number' ? payload.price : 0;
            const discount = typeof payload.discount === 'number' ? payload.discount : 0;
            let price = priceRaw;
            const newItem: any = { ...payload };
            if (discount > 0 && priceRaw > 0) {
              newItem.originalPrice = priceRaw;
              price = Math.round(priceRaw * (1 - discount / 100) * 100) / 100;
            }
            newItem.price = price;

            // Логика наличия: если quantity задан и > 0, ограничиваем; если его нет или <=0, не ограничиваем (legacy поведение "как раньше").
            const quantity = typeof payload.quantity === 'number' ? payload.quantity : undefined;
            const reserved = typeof payload.reserved === 'number' ? payload.reserved : 0;
            const finiteAvailable = typeof quantity === 'number' && quantity > 0
              ? Math.max(0, quantity - reserved)
              : Infinity; // отсутствует реальное ограничение

            if (finiteAvailable === 0) {
              // всё зарезервировано
              return;
            }

            newItem.count = Math.min(inc, finiteAvailable);
            state.items.push(newItem);
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
    },
    setGiftWrap: (state, action: PayloadAction<GiftWrap | null>) => {
      state.giftWrap = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, decrementCount, setGiftWrap } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;