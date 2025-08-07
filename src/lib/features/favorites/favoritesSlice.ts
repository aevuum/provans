// lib/features/favorites/favoritesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface FavoritesState {
  items: Product[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { addToFavorites, removeFromFavorites, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;