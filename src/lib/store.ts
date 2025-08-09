// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';

import uiReducer from '@/lib/features/ui/uiSlice';
import cartReducer from '@/lib/features/cart/cartSlice';
import favoritesReducer from '@/lib/features/favorites/favoritesSlice';
import productsReducer from '@/lib/features/products/productsSlice';
import notificationsReducer from '@/lib/features/notifications/notificationSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  cart: cartReducer,
  favorites: favoritesReducer,
  products: productsReducer,
  notifications: notificationsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
