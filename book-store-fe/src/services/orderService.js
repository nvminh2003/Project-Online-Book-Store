import axios from "axios";
import apiClient from './apiClient';

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const orderService = {

  // Lấy danh sách đơn hàng của user (customer)
  getUserOrders: async (params = {}) => {
    try {
      const token = getToken();
      const response = await apiClient.get(`${API_URL}/orders/my-orders`, {
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

  // Lấy chi tiết đơn hàng theo id (customer)
  getOrderDetail: async (id) => {
    try {
      const token = getToken();
      const response = await apiClient.get(`${API_URL}/orders/${id}/detail`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy tất cả orders (admin business)
  getAllOrders: async (params = {}) => {
    try {
      const token = getToken();
      const response = await apiClient.get(`${API_URL}/orders`, {
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
      const response = await apiClient.get(`${API_URL}/orders/${id}/detail`, {
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
      const response = await apiClient.patch(`${API_URL}/orders/update-order-status/${id}`, { orderStatus }, {
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
      const response = await apiClient.patch(`${API_URL}/orders/update-payment-status/${id}`, { paymentStatus }, {
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
  exportOrdersToExcel: async (queryString = '') => {
    try {
      const token = getToken();
      const response = await apiClient.get(`${API_URL}/orders/export/excel?${queryString}`, {
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

  createOrderAPI: async (orderDetails) => {
    const token = getToken();
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return apiClient.post(`${API_URL}/orders`, orderDetails, config);
  },

  // Fetch order history (paginated)
  fetchOrderHistoryAPI: async ({ page = 1, limit = 10 } = {}) => {
    const token = getToken();
    const config = {
      headers: { "Content-Type": "application/json" },
      params: { page, limit },
    };
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return apiClient.get(`${API_URL}/orders`, config);
  },

  fetchOrderDetailAPI: async (orderId) => {
    const token = getToken();
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return apiClient.get(`${API_URL}/orders/${orderId}`, config);
  },

  payosCheckoutSuccess: async (orderId) => {
    const token = getToken();
    const config = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    return apiClient.get(`${API_URL}/orders/payos/success/${orderId}`, config);
  },

  payosCheckoutCancel: async (orderId) => {
    const token = getToken();
    const config = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    return apiClient.get(`${API_URL}/orders/payos/cancel/${orderId}`, config);
  },

  // Hủy đơn hàng bởi customer
  cancelOrderByCustomer: async (orderId) => {
    try {
      const token = getToken();
      const response = await apiClient.patch(`${API_URL}/orders/cancel-by-customer/${orderId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  // payosCheckoutCancel: async (orderId) => {
  //   return axios.get(`${API_URL}/orders/payos/cancel/${orderId}`);
  // },
};

export default orderService;
