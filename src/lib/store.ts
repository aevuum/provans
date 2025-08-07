// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/lib/features/ui/uiSlice';
import cartReducer from '@/lib/features/cart/cartSlice';
import favoritesReducer from '@/lib/features/favorites/favoritesSlice';
import productsReducer from '@/lib/features/products/productsSlice';
import notificationsReducer from '@/lib/features/notifications/notificationSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      cart: cartReducer,
      favorites: favoritesReducer,
      products: productsReducer,
      notifications: notificationsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const store = makeStore();
