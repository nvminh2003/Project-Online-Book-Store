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
  total: 0,
  status: "idle",
  error: null,
  couponStatus: "idle",
  couponError: null,
  couponAppliedDetails: null,
};

// Helper function để cập nhật state từ payload API thành công
const updateCartStateFromFulfilledAPI = (state, actionPayloadFromThunk) => {
  // Đổi tên tham số cho rõ ràng
  console.log(
    "cartSlice: Updating state from fulfilled API. Payload received by helper:",
    actionPayloadFromThunk
  );

  // Đảm bảo actionPayloadFromThunk là object data giỏ hàng, không phải object action Redux
  if (
    actionPayloadFromThunk &&
    typeof actionPayloadFromThunk === "object" &&
    Array.isArray(actionPayloadFromThunk.items)
  ) {
    state.items = actionPayloadFromThunk.items;
    state.user = actionPayloadFromThunk.user || null;
    state.total = actionPayloadFromThunk.total || 0;
    state.status = "succeeded";
    state.error = null;

    if (actionPayloadFromThunk.couponDetails) {
      state.couponAppliedDetails = actionPayloadFromThunk.couponDetails;
    } else if (
      actionPayloadFromThunk.hasOwnProperty("couponDetails") &&
      actionPayloadFromThunk.couponDetails === null
    ) {
      state.couponAppliedDetails = null;
    }
  } else {
    console.error(
      "cartSlice: Invalid payload received in updateCartStateFromFulfilledAPI. Expected cart data object, got:",
      actionPayloadFromThunk
    );
    // Giữ lại state cũ hoặc set lỗi nếu payload không đúng để tránh làm trống giỏ hàng
    state.status = "failed"; // Đánh dấu là thất bại nếu payload không đúng
    state.error = "Invalid data structure received from server.";
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => {
      console.log("cartSlice: Resetting cart state to initial");
      return initialState;
    },
    resetCouponStatus: (state) => {
      console.log("cartSlice: Resetting coupon status");
      state.couponStatus = "idle";
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    const createPendingHandler = (statusPrefix) => (state) => {
      state.status = `loading_${statusPrefix}`;
      state.error = null;
    };
    const createRejectedHandler = (statusPrefix) => (state, action) => {
      state.status = `failed_${statusPrefix}`;
      state.error = action.payload; // action.payload từ rejectWithValue
      console.error(`cartSlice: ${statusPrefix} rejected - `, action.payload);
    };

    // fetchCart
    builder
      .addCase(fetchCart.pending, createPendingHandler("fetch"))
      .addCase(fetchCart.fulfilled, (state, action) => {
        // action.payload ở đây chính là response.data.data từ thunk fetchCart
        updateCartStateFromFulfilledAPI(state, action.payload);
        if (!action.payload.couponDetails && state.couponAppliedDetails) {
          state.couponAppliedDetails = null;
          state.couponStatus = "idle";
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        createRejectedHandler("fetch")(state, action);
        state.items = [];
        state.total = 0;
        state.couponAppliedDetails = null;
      });

    // addItemToCartAPI
    builder
      .addCase(addItemToCartAPI.pending, createPendingHandler("add"))
      .addCase(addItemToCartAPI.fulfilled, (state, action) => {
        // action.payload là response.data.data từ thunk addItemToCartAPI
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(addItemToCartAPI.rejected, createRejectedHandler("add"));

    // updateCartItemQuantityAPI
    builder
      .addCase(
        updateCartItemQuantityAPI.pending,
        createPendingHandler("update")
      )
      .addCase(updateCartItemQuantityAPI.fulfilled, (state, action) => {
        // action.payload là response.data.data từ thunk updateCartItemQuantityAPI
        console.log(
          "cartSlice: updateCartItemQuantityAPI.fulfilled in extraReducers. action.payload:",
          action.payload
        );
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(
        updateCartItemQuantityAPI.rejected,
        createRejectedHandler("update")
      );

    // removeCartItemAPI
    builder
      .addCase(removeCartItemAPI.pending, createPendingHandler("remove"))
      .addCase(removeCartItemAPI.fulfilled, (state, action) => {
        // action.payload là response.data.data từ thunk removeCartItemAPI
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(removeCartItemAPI.rejected, createRejectedHandler("remove"));

    // applyCouponToCartAPI
    builder
      .addCase(applyCouponToCartAPI.pending, (state) => {
        state.couponStatus = "loading";
        state.couponError = null;
        state.couponAppliedDetails = null;
      })
      .addCase(applyCouponToCartAPI.fulfilled, (state, action) => {
        // action.payload là response.data.data từ thunk applyCouponToCartAPI
        updateCartStateFromFulfilledAPI(state, action.payload);
        state.couponAppliedDetails = action.payload.couponDetails || null;
        state.couponStatus = "succeeded";
      })
      .addCase(applyCouponToCartAPI.rejected, (state, action) => {
        state.couponStatus = "failed";
        state.couponError = action.payload;
        state.couponAppliedDetails = null;
        state.status = "succeeded"; // Giỏ hàng có thể vẫn ok, chỉ coupon lỗi
      });

    // clearCartAPI
    builder
      .addCase(clearCartAPI.pending, createPendingHandler("clear"))
      .addCase(clearCartAPI.fulfilled, (state, action) => {
        // action.payload là response.data.data từ thunk clearCartAPI
        updateCartStateFromFulfilledAPI(state, action.payload);
        state.couponAppliedDetails = null;
        state.couponStatus = "idle";
      })
      .addCase(clearCartAPI.rejected, createRejectedHandler("clear"));
  },
});

export const { resetCart, resetCouponStatus } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartItems = (state) => state.cart.items;
export const selectCartSubtotal = (state) => state.cart.total;
