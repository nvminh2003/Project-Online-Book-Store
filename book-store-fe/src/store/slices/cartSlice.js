// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Cấu hình Base URL và Hàm Lấy Token ---
const API_BASE_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

const getAxiosConfig = () => {
  const token = getAuthToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};
// --- Kết thúc Cấu hình ---

// Async Thunk để lấy giỏ hàng từ backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      console.log("cartSlice: Fetching cart...");
      const response = await axios.get(
        `${API_BASE_URL}/cart`,
        getAxiosConfig()
      );
      console.log("cartSlice: Fetch cart response data:", response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch cart";
      console.error(
        "cartSlice: Fetch cart error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để thêm sản phẩm vào giỏ hàng
export const addItemToCartAPI = createAsyncThunk(
  "cart/addItemToCartAPI",
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      console.log(
        `cartSlice: Adding item - bookId: ${bookId}, quantity: ${quantity}`
      );
      const response = await axios.post(
        `${API_BASE_URL}/cart/add`,
        { bookId, quantity },
        getAxiosConfig()
      );
      console.log("cartSlice: Add item response data:", response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add item to cart";
      console.error(
        "cartSlice: Add item error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemQuantityAPI = createAsyncThunk(
  "cart/updateCartItemQuantityAPI",
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      console.log(
        `cartSlice: Updating item quantity - bookId: ${bookId}, quantity: ${quantity}`
      );
      const response = await axios.put(
        `${API_BASE_URL}/cart/items/${bookId}`,
        { quantity },
        getAxiosConfig()
      );
      console.log(
        "cartSlice: Update item quantity response data:",
        response.data.data
      );
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update item quantity";
      console.error(
        "cartSlice: Update item quantity error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để xóa sản phẩm khỏi giỏ hàng
export const removeCartItemAPI = createAsyncThunk(
  "cart/removeCartItemAPI",
  async (bookId, { rejectWithValue }) => {
    try {
      console.log(`cartSlice: Removing item - bookId: ${bookId}`);
      const response = await axios.delete(
        `${API_BASE_URL}/cart/items/${bookId}`,
        getAxiosConfig()
      );
      console.log("cartSlice: Remove item response data:", response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove item from cart";
      console.error(
        "cartSlice: Remove item error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để áp dụng mã giảm giá
export const applyCouponToCartAPI = createAsyncThunk(
  "cart/applyCouponToCartAPI",
  async (couponCode, { rejectWithValue }) => {
    try {
      console.log(`cartSlice: Applying coupon - code: ${couponCode}`);
      // Đảm bảo endpoint này tồn tại ở backend: POST /api/cart/coupon
      const response = await axios.post(
        `${API_BASE_URL}/cart/coupon`,
        { couponCode },
        getAxiosConfig()
      );
      console.log("cartSlice: Apply coupon response data:", response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Invalid coupon code or failed to apply";
      console.error(
        "cartSlice: Apply coupon error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để xóa toàn bộ giỏ hàng
export const clearCartAPI = createAsyncThunk(
  "cart/clearCartAPI",
  async (_, { rejectWithValue }) => {
    try {
      console.log("cartSlice: Clearing cart");
      const response = await axios.delete(
        `${API_BASE_URL}/cart/clear`,
        getAxiosConfig()
      );
      console.log("cartSlice: Clear cart response data:", response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to clear cart";
      console.error(
        "cartSlice: Clear cart error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  items: [],
  user: null,
  total: 0, // Sẽ được cập nhật trực tiếp từ payload của các API thành công
  status: "idle", // 'idle' | 'loading_fetch' | 'loading_add' | 'loading_update' | 'loading_remove' | 'loading_clear' | 'succeeded' | 'failed'
  error: null,
  couponStatus: "idle",
  couponError: null,
  couponAppliedDetails: null, // Ví dụ: { code, discountType, value, discountAmountCalculated }
};

// Helper function để cập nhật state từ payload API thành công
const updateCartStateFromFulfilledAPI = (state, actionPayload) => {
  console.log(
    "cartSlice: Updating state from fulfilled API. Payload:",
    actionPayload
  );
  state.items = actionPayload.items || [];
  state.user = actionPayload.user || null;
  state.total = actionPayload.total || 0;
  state.status = "succeeded";
  state.error = null;

  // Xử lý thông tin coupon nếu có
  if (actionPayload.couponDetails) {
    state.couponAppliedDetails = actionPayload.couponDetails;
  } else if (
    actionPayload.hasOwnProperty("couponDetails") &&
    actionPayload.couponDetails === null
  ) {
    // Nếu backend trả về couponDetails là null (ví dụ sau khi clear cart, hoặc fetch cart không có coupon)
    state.couponAppliedDetails = null;
  }
  // Nếu action hiện tại không phải là applyCoupon, giữ nguyên couponStatus và couponError
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => {
      console.log("cartSlice: Resetting cart state");
      return initialState;
    },
    resetCouponStatus: (state) => {
      console.log("cartSlice: Resetting coupon status");
      state.couponStatus = "idle";
      state.couponError = null;
      // Không reset couponAppliedDetails ở đây trừ khi có logic cụ thể
    },
  },
  extraReducers: (builder) => {
    // Định nghĩa các trạng thái loading cụ thể cho từng action
    const createPendingHandler = (statusPrefix) => (state) => {
      state.status = `loading_${statusPrefix}`;
      state.error = null;
    };
    const createRejectedHandler = (statusPrefix) => (state, action) => {
      state.status = `failed_${statusPrefix}`; // Hoặc chỉ là 'failed'
      state.error = action.payload;
    };

    // fetchCart
    builder
      .addCase(fetchCart.pending, createPendingHandler("fetch"))
      .addCase(fetchCart.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload);
        // Nếu fetchCart không có couponDetails rõ ràng, reset thông tin coupon hiện tại
        if (!action.payload.couponDetails && state.couponAppliedDetails) {
          state.couponAppliedDetails = null;
          state.couponStatus = "idle";
          state.couponError = null;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        createRejectedHandler("fetch")(state, action);
        state.items = []; // Xóa items nếu fetch lỗi
        state.total = 0;
        state.couponAppliedDetails = null;
      });

    // addItemToCartAPI
    builder
      .addCase(addItemToCartAPI.pending, createPendingHandler("add"))
      .addCase(addItemToCartAPI.fulfilled, updateCartStateFromFulfilledAPI)
      .addCase(addItemToCartAPI.rejected, createRejectedHandler("add"));

    // updateCartItemQuantityAPI
    builder
      .addCase(
        updateCartItemQuantityAPI.pending,
        createPendingHandler("update")
      )
      .addCase(
        updateCartItemQuantityAPI.fulfilled,
        updateCartStateFromFulfilledAPI
      )
      .addCase(
        updateCartItemQuantityAPI.rejected,
        createRejectedHandler("update")
      );

    // removeCartItemAPI
    builder
      .addCase(removeCartItemAPI.pending, createPendingHandler("remove"))
      .addCase(removeCartItemAPI.fulfilled, updateCartStateFromFulfilledAPI)
      .addCase(removeCartItemAPI.rejected, createRejectedHandler("remove"));

    // applyCouponToCartAPI
    builder
      .addCase(applyCouponToCartAPI.pending, (state) => {
        state.couponStatus = "loading";
        state.couponError = null;
        state.couponAppliedDetails = null; // Reset khi thử áp dụng coupon mới
      })
      .addCase(applyCouponToCartAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload); // Giỏ hàng đã được cập nhật với discount
        state.couponAppliedDetails = action.payload.couponDetails || null;
        state.couponStatus = "succeeded";
      })
      .addCase(applyCouponToCartAPI.rejected, (state, action) => {
        state.couponStatus = "failed";
        state.couponError = action.payload;
        state.couponAppliedDetails = null;
        state.status = "succeeded"; // Giỏ hàng vẫn có thể thành công, chỉ coupon lỗi
      });

    // clearCartAPI
    builder
      .addCase(clearCartAPI.pending, createPendingHandler("clear"))
      .addCase(clearCartAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload); // Sẽ là giỏ hàng trống
        state.couponAppliedDetails = null; // Xóa coupon khi xóa giỏ hàng
        state.couponStatus = "idle";
      })
      .addCase(clearCartAPI.rejected, createRejectedHandler("clear"));
  },
});

export const { resetCart, resetCouponStatus } = cartSlice.actions;
export default cartSlice.reducer;
