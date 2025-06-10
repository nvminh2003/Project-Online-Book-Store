import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  discountAmount: 0,
  shippingFee: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateCartItemQuantity(state, action) {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    },
    removeCartItem(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter((i) => i.id !== itemId);
    },
    applyCouponToCart(state, action) {
      // Placeholder for applying coupon logic
      // For example, set discountAmount based on coupon code
      state.discountAmount = 10; // example fixed discount
    },
  },
});

export const { updateCartItemQuantity, removeCartItem, applyCouponToCart } =
  cartSlice.actions;

export default cartSlice.reducer;
