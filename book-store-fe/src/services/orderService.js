import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const orderService = {
  // Lấy tất cả orders (admin business)
  getAllOrders: async (params = {}) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/orders`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết order theo id (admin business)
  getOrderById: async (id) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/orders/${id}/detail`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (id, orderStatus) => {
    try {
      const token = getToken();
      const response = await axios.patch(`${API_URL}/orders/update-order-status/${id}`, { orderStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (id, paymentStatus) => {
    try {
      const token = getToken();
      const response = await axios.patch(`${API_URL}/orders/update-payment-status/${id}`, { paymentStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export orders to Excel
  exportOrdersToExcel: async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/orders/export/excel`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Các hàm PayOS giữ nguyên
  payosCheckoutSuccess: async (orderId) => {
    return axios.get(`${API_URL}/orders/payos/success/${orderId}`);
  },
  payosCheckoutCancel: async (orderId) => {
    return axios.get(`${API_URL}/orders/payos/cancel/${orderId}`);
  },
};

// Create a new order
export const createOrderAPI = async (orderDetails) => {
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.post(`${API_URL}/orders`, orderDetails, config);
};

// Fetch order history (paginated)
export const fetchOrderHistoryAPI = async ({ page = 1, limit = 10 } = {}) => {
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: { "Content-Type": "application/json" },
    params: { page, limit },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.get(`${API_URL}/orders`, config);
};

// Fetch order detail by ID
export const fetchOrderDetailAPI = async (orderId) => {
  const token = localStorage.getItem("accessToken");
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.get(`${API_URL}/orders/${orderId}`, config);
};
