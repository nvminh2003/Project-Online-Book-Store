import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Configuration for API base URL and token
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

// Async Thunk to create a new order
export const createOrderAPI = createAsyncThunk(
  "order/createOrderAPI",
  async (orderDetails, { rejectWithValue }) => {
    try {
      console.log("orderSlice: Creating order with details:", orderDetails);
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        orderDetails,
        getAxiosConfig()
      );
      console.log("orderSlice: Create order response:", response.data.data);
      return response.data.data;
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

// Async Thunk to fetch user order history
export const fetchOrderHistoryAPI = createAsyncThunk(
  "order/fetchOrderHistoryAPI",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        ...getAxiosConfig(),
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch order history";
      return rejectWithValue(errorMsg);
    }
  }
);

// Async Thunk to fetch details of a single order
export const fetchOrderDetailAPI = createAsyncThunk(
  "order/fetchOrderDetailAPI",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders/${orderId}`,
        getAxiosConfig()
      );
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch order detail";
      return rejectWithValue(errorMsg);
    }
  }
);

const orderInitialState = {
  currentOrder: null,
  orderHistory: [],
  pagination: null,
  status: "idle",
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState: orderInitialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.status = "idle";
      state.error = null;
    },
    resetOrderStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAPI.pending, (state) => {
        state.status = "loading_create";
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(createOrderAPI.fulfilled, (state, action) => {
        state.status = "succeeded_create";
        state.currentOrder = {
          ...action.payload,
          paymentMethod: action.meta.arg.paymentMethod,
        };
      })
      .addCase(createOrderAPI.rejected, (state, action) => {
        state.status = "failed_create";
        state.error = action.payload;
      })
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
      })
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

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderStatus = (state) => state.order.status;
export const selectOrderError = (state) => state.order.error;
export const selectOrderHistory = (state) => state.order.orderHistory;
export const selectOrderPagination = (state) => state.order.pagination;

export default orderSlice.reducer;
