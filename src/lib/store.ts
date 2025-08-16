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

// Persistence: simple localStorage for cart and favorites
function loadState() {
  if (typeof window === 'undefined') return undefined;
  try {
    const serial = localStorage.getItem('app_state');
    if (!serial) return undefined;
    return JSON.parse(serial);
  } catch {
    return undefined;
  }
}

function saveState(state: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('app_state', JSON.stringify(state));
  } catch {
    // ignore
  }
}

const preloaded = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: preloaded,
});

// Debounced persist
let timeout: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    const state = store.getState();
    // persist only necessary slices
    saveState({
      ui: state.ui,
      cart: state.cart,
      favorites: state.favorites,
      notifications: { ...state.notifications, items: [] },
      products: state.products,
    });
  }, 250);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
