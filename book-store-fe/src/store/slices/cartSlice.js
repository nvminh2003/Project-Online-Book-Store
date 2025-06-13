// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Import axios trực tiếp

// --- CẦN BẠN CẤU HÌNH ---
// 1. Đặt BASE URL của backend API của bạn
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
//    Ví dụ: 'http://localhost:5000/api' nếu backend chạy ở port 5000 và có prefix /api
//    THAY THẾ 'http://localhost:5000/api' BẰNG URL ĐÚNG CỦA BẠN HOẶC CẤU HÌNH BIẾN MÔI TRƯỜNG

// 2. Hàm lấy token xác thực
//    Điều chỉnh hàm này để lấy token từ nơi bạn lưu trữ
//    (localStorage, AuthContext, hoặc từ một state Redux khác)
const getAuthToken = () => {
  // VÍ DỤ LẤY TỪ LOCALSTORAGE:
  return localStorage.getItem("authToken"); // Hoặc tên key bạn dùng
  // NẾU LẤY TỪ REDUX STORE (ví dụ state.auth.token), bạn sẽ cần dùng `thunkAPI.getState()`
  // bên trong mỗi async thunk.
};

// 3. Hàm tạo config cho Axios request (bao gồm headers)
//    Nếu bạn lấy token từ Redux store, bạn sẽ gọi hàm này với `thunkAPI`
const getAuthConfig = (thunkAPIForToken) => {
  // thunkAPIForToken là tùy chọn
  let token;
  if (thunkAPIForToken && typeof thunkAPIForToken.getState === "function") {
    // Ví dụ nếu token trong Redux store là state.auth.token
    // token = thunkAPIForToken.getState().auth?.token; // Bỏ comment và ĐIỀU CHỈNH ĐƯỜNG DẪN
    // Hiện tại, ví dụ dưới đây vẫn dùng getAuthToken() cho đơn giản nếu bạn chưa tích hợp lấy từ store
    token = getAuthToken(); // Nếu không dùng getState, hàm này phải tự lấy token
  } else {
    token = getAuthToken();
  }

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
// --- KẾT THÚC PHẦN CẦN CẤU HÌNH ---

// Async Thunk để lấy giỏ hàng từ backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cart`,
        getAuthConfig(thunkAPI)
      );
      return response.data.data; // Backend trả về { message, status, data: { items, total, user, ... } }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch cart";
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: ", errorMsg);
        // Xử lý logout hoặc redirect có thể được thực hiện ở component dựa trên error này
      }
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để thêm sản phẩm vào giỏ hàng
export const addItemToCartAPI = createAsyncThunk(
  "cart/addItemToCartAPI",
  async ({ bookId, quantity }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cart/add`,
        { bookId, quantity },
        getAuthConfig(thunkAPI)
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add item to cart"
      );
    }
  }
);

// Async Thunk để cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemQuantityAPI = createAsyncThunk(
  "cart/updateCartItemQuantityAPI",
  async ({ bookId, quantity }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cart/items/${bookId}`,
        { quantity },
        getAuthConfig(thunkAPI)
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update item quantity"
      );
    }
  }
);

// Async Thunk để xóa sản phẩm khỏi giỏ hàng
export const removeCartItemAPI = createAsyncThunk(
  "cart/removeCartItemAPI",
  async (bookId, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/cart/items/${bookId}`,
        getAuthConfig(thunkAPI)
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove item from cart"
      );
    }
  }
);

// Async Thunk để áp dụng mã giảm giá (CẦN ENDPOINT BACKEND: POST /api/cart/coupon)
export const applyCouponToCartAPI = createAsyncThunk(
  "cart/applyCouponToCartAPI",
  async (couponCode, thunkAPI) => {
    try {
      // Giả sử bạn có endpoint POST /api/cart/coupon
      const response = await axios.post(
        `${API_BASE_URL}/cart/coupon`,
        { couponCode },
        getAuthConfig(thunkAPI)
      );
      // Backend nên trả về giỏ hàng đã cập nhật với thông tin giảm giá
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Invalid coupon code or failed to apply"
      );
    }
  }
);

// Async Thunk để xóa toàn bộ giỏ hàng
export const clearCartAPI = createAsyncThunk(
  "cart/clearCartAPI",
  async (_, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/cart/clear`,
        getAuthConfig(thunkAPI)
      );
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to clear cart"
      );
    }
  }
);

const initialState = {
  items: [],
  user: null,
  total: 0,
  status: "idle", // 'idle' | 'loading_fetch' | 'loading_add' | 'loading_update' | 'loading_remove' | 'loading_clear' | 'succeeded' | 'failed'
  error: null,
  couponStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  couponError: null,
  couponAppliedDetails: null, // { code, discountType, value, discountAmountCalculated }
};

// Helper function để cập nhật state từ payload API
const updateCartStateFromFulfilledAPI = (state, actionPayload) => {
  state.items = actionPayload.items || [];
  state.user = actionPayload.user || null;
  state.total = actionPayload.total || 0;
  state.status = "succeeded"; // Trạng thái chung sau khi thành công
  state.error = null;

  if (actionPayload.couponDetails) {
    state.couponAppliedDetails = actionPayload.couponDetails;
  } else if (
    actionPayload.total <
    actionPayload.items.reduce(
      (sum, item) => sum + (item.book?.sellingPrice || 0) * item.quantity,
      0
    )
  ) {
    // Logic này có thể cần xem lại, backend nên trả về couponDetails rõ ràng
  }
  // Không tự động reset couponAppliedDetails ở đây, để applyCouponToCartAPI.fulfilled xử lý
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState, // Action để reset giỏ hàng (ví dụ khi logout)
    resetCouponStatus: (state) => {
      state.couponStatus = "idle";
      state.couponError = null;
      // Không reset couponAppliedDetails ở đây, chỉ reset khi áp dụng coupon mới hoặc fetchCart
    },
    // Các reducers optimistic có thể thêm ở đây nếu cần
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading_fetch"; // Trạng thái loading cụ thể
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload);
        // Nếu fetchCart không trả về couponDetails nhưng total < subtotal, có thể coupon cũ vẫn còn.
        // Nếu muốn reset coupon khi fetch lại cart, thì thêm:
        if (!action.payload.couponDetails) {
          state.couponAppliedDetails = null;
          state.couponStatus = "idle"; // Reset trạng thái coupon nếu không có thông tin
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.items = [];
        state.total = 0;
        state.couponAppliedDetails = null; // Reset coupon nếu fetch lỗi
      });

    // addItemToCartAPI
    builder
      .addCase(addItemToCartAPI.pending, (state) => {
        state.status = "loading_add";
        state.error = null;
      })
      .addCase(addItemToCartAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(addItemToCartAPI.rejected, (state, action) => {
        state.status = "failed"; // Trạng thái thất bại chung
        state.error = action.payload;
      });

    // updateCartItemQuantityAPI
    builder
      .addCase(updateCartItemQuantityAPI.pending, (state) => {
        state.status = "loading_update";
        state.error = null;
      })
      .addCase(updateCartItemQuantityAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(updateCartItemQuantityAPI.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // removeCartItemAPI
    builder
      .addCase(removeCartItemAPI.pending, (state) => {
        state.status = "loading_remove";
        state.error = null;
      })
      .addCase(removeCartItemAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload);
      })
      .addCase(removeCartItemAPI.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    // applyCouponToCartAPI
    builder
      .addCase(applyCouponToCartAPI.pending, (state) => {
        state.couponStatus = "loading";
        state.couponError = null;
        state.couponAppliedDetails = null; // Reset khi thử áp dụng coupon mới
      })
      .addCase(applyCouponToCartAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload); // Giỏ hàng đã được cập nhật với discount
        state.couponAppliedDetails = action.payload.couponDetails || null; // Giả định backend trả về
        state.couponStatus = "succeeded";
        state.couponError = null;
      })
      .addCase(applyCouponToCartAPI.rejected, (state, action) => {
        state.couponStatus = "failed";
        state.couponError = action.payload;
        state.couponAppliedDetails = null;
        // Không thay đổi state.status hoặc state.error chung ở đây, vì đây là lỗi của coupon
      });

    // clearCartAPI
    builder
      .addCase(clearCartAPI.pending, (state) => {
        state.status = "loading_clear";
        state.error = null;
      })
      .addCase(clearCartAPI.fulfilled, (state, action) => {
        updateCartStateFromFulfilledAPI(state, action.payload); // Sẽ là giỏ hàng trống
        state.couponAppliedDetails = null; // Xóa coupon khi xóa giỏ hàng
        state.couponStatus = "idle";
      })
      .addCase(clearCartAPI.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCart, resetCouponStatus } = cartSlice.actions;
export default cartSlice.reducer;
