import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { notificationsReducer } from './features/notifications/notificationSlice';
import { favoritesReducer } from './features/favorites/favoritesSlice';
import { productsReducer } from './features/products/productsSlice';
import { cartReducer } from './features/cart/cartSlice';
import { uiReducer } from './features/ui/uiSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  cart: cartReducer,
  favorites: favoritesReducer,
  products: productsReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const loadState = (): Partial<RootState> | undefined => {
  if (typeof window === 'undefined') return undefined;

  try {
    const stored = localStorage.getItem('app_state');
    if (!stored) return undefined;

    const parsed = JSON.parse(stored);
    localStorage.removeItem('app_state');

    if (typeof parsed !== 'object' || parsed === null) return undefined;

    const { ui, cart, favorites, products, notifications } = parsed;

    const state: Partial<RootState> = {};

    if (ui && typeof ui === 'object') state.ui = ui;
    if (cart && typeof cart === 'object') state.cart = cart;
    if (favorites && typeof favorites === 'object') state.favorites = favorites;
    if (products && typeof products === 'object') state.products = products;
    if (notifications && typeof notifications === 'object') {
      state.notifications = { ...notifications, items: [] };
    }

    return state;
  } catch (err) {
    console.warn('Failed to load state from localStorage', err);
    localStorage.removeItem('app_state');
    return undefined;
  }
};

export const saveState = (state: RootState): void => {
  if (typeof window === 'undefined') return;

  try {
    const stateToSave = {
      ui: state.ui,
      cart: state.cart,
      favorites: state.favorites,
      products: state.products,
      notifications: { ...state.notifications, items: [] },
    };
    const serialized = JSON.stringify(stateToSave);
    localStorage.setItem('app_state', serialized);
  } catch (err) {
    console.warn('Failed to save state to localStorage', err);
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState(store.getState());
  }, 250);
});

export type AppDispatch = typeof store.dispatch;