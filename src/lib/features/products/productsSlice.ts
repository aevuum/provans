// lib/features/products/productsSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Product, ProductsApiResponse, ProductFilters } from '@/types';

interface ProductsState {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: ProductFilters;
}

const initialState: ProductsState = {
  items: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  status: 'idle',
  error: null,
  filters: {}
};

// Async thunk для загрузки продуктов с фильтрами
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();

    // Добавляем параметры фильтрации
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const response = await fetch(`/api/products?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки продуктов');
    }

    const data: ProductsApiResponse = await response.json();
    return { data: data.data, meta: data.meta, filters };
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateProduct(state, action) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    confirmProduct(state, action) {
      const idx = state.items.findIndex(p => p.id === action.payload);
      if (idx !== -1) state.items[idx].isConfirmed = true;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.filters = action.payload.filters;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка загрузки продуктов';
      });
  },
});

export const { updateProduct, confirmProduct, setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;