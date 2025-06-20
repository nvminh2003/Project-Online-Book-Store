// src/store/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Cấu hình Base URL và Hàm Lấy Token (Tương tự cartSlice) ---
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

// Async Thunk để tạo đơn hàng mới
export const createOrderAPI = createAsyncThunk(
  "order/createOrderAPI",
  async (orderDetails, { rejectWithValue, dispatch }) => {
    // orderDetails sẽ là object: { fullName, phone, address, discountCode, paymentMethod }
    try {
      console.log("orderSlice: Creating order with details:", orderDetails);
      const response = await axios.post(
        `${API_BASE_URL}/orders/create`,
        orderDetails,
        getAxiosConfig()
      );
      console.log("orderSlice: Create order response:", response.data.data);
      // Sau khi tạo đơn hàng thành công, backend đã xóa giỏ hàng.
      // Chúng ta cũng nên fetch lại giỏ hàng (giờ sẽ trống) để cập nhật UI header cart.
      // Hoặc dispatch một action để xóa cart ở client side nếu backend không trả về cart mới.
      // import { fetchCart } from './cartSlice'; // Cẩn thận circular dependency nếu import trực tiếp
      // dispatch(fetchCart()); // Cách này có thể gây circular dependency.
      // Tốt hơn là sau khi order thành công, CartPage hoặc component cha sẽ tự fetchCart.
      // Hoặc dispatch một action riêng để reset cart trong cartSlice.
      // import { resetCart } from './cartSlice';
      // dispatch(resetCart());

      return response.data.data; // Backend trả về đơn hàng đã được populate
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create order";
      console.error(
        "orderSlice: Create order error - ",
        errorMsg,
        error.response?.status
      );
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để lấy lịch sử đơn hàng của người dùng
export const fetchOrderHistoryAPI = createAsyncThunk(
  "order/fetchOrderHistoryAPI",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    // Thêm default_factory
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        ...getAxiosConfig(),
        params: { page, limit },
      });
      return response.data.data; // Backend trả về { orders, pagination }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch order history";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk để lấy chi tiết một đơn hàng
export const fetchOrderDetailAPI = createAsyncThunk(
  "order/fetchOrderDetailAPI",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders/${orderId}`,
        getAxiosConfig()
      );
      return response.data.data; // Backend trả về chi tiết đơn hàng
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch order detail";
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  currentOrder: null, // Đơn hàng vừa được tạo hoặc đang xem chi tiết
  orderHistory: [],
  pagination: null, // { page, limit, total, totalPages }
  status: "idle", // 'idle' | 'loading_create' | 'loading_history' | 'loading_detail' | 'succeeded' | 'failed'
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.status = "idle"; // Reset status liên quan đến currentOrder
      state.error = null;
    },
    resetOrderStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // createOrderAPI
    builder
      .addCase(createOrderAPI.pending, (state) => {
        state.status = "loading_create";
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(createOrderAPI.fulfilled, (state, action) => {
        state.status = "succeeded_create"; // Trạng thái thành công cụ thể
        state.currentOrder = action.payload; // Lưu đơn hàng vừa tạo
        // Không cần cập nhật orderHistory ở đây, người dùng sẽ xem ở trang lịch sử
      })
      .addCase(createOrderAPI.rejected, (state, action) => {
        state.status = "failed_create";
        state.error = action.payload;
      });

    // fetchOrderHistoryAPI
    builder
      .addCase(fetchOrderHistoryAPI.pending, (state) => {
        state.status = "loading_history";
        state.error = null;
      })
      .addCase(fetchOrderHistoryAPI.fulfilled, (state, action) => {
        state.status = "succeeded_history";
        state.orderHistory = action.payload.orders || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchOrderHistoryAPI.rejected, (state, action) => {
        state.status = "failed_history";
        state.error = action.payload;
        state.orderHistory = [];
        state.pagination = null;
      });

    // fetchOrderDetailAPI
    builder
      .addCase(fetchOrderDetailAPI.pending, (state) => {
        state.status = "loading_detail";
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderDetailAPI.fulfilled, (state, action) => {
        state.status = "succeeded_detail";
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetailAPI.rejected, (state, action) => {
        state.status = "failed_detail";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder, resetOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
