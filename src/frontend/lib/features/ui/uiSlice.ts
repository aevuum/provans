// lib/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  showCart: boolean
  showFavorites: boolean
  showSearch: boolean
  searchQuery: string
}

const initialState: UIState = {
  showCart: false,
  showFavorites: false,
  showSearch: false,
  searchQuery: '',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state, action: PayloadAction<boolean | undefined>) => {
      state.showCart = action.payload ?? !state.showCart
    },
    toggleFavorites: (state, action: PayloadAction<boolean | undefined>) => {
      state.showFavorites = action.payload ?? !state.showFavorites
    },
    toggleSearch: (state, action: PayloadAction<boolean | undefined>) => {
      state.showSearch = action.payload ?? !state.showSearch
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const { toggleCart, toggleFavorites, toggleSearch, setSearchQuery } = uiSlice.actions
export const uiReducer = uiSlice.reducer