import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    discount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { id, breadType } = action.payload;
      const cartId = breadType ? `${id}-${breadType}` : id;
      
      const existingItem = state.items.find(item => item.cartId === cartId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, cartId, quantity: 1 });
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.cartId !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    updateQuantity: (state, action) => {
      const { cartId, quantity } = action.payload;
      const item = state.items.find(item => item.cartId === cartId);
      if (item && quantity > 0) {
        item.quantity = quantity;
      } else if (item && quantity === 0) {
        state.items = state.items.filter(item => item.cartId !== cartId);
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.discount = 0;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setDiscount } = cartSlice.actions;
export default cartSlice.reducer;
