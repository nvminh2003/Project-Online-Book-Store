import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getToken = () =>
  localStorage.getItem("accessToken") || localStorage.getItem("access_token");

// Export individual functions to match how they're being imported elsewhere
export const getAllOrders = async (params = {}) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/orders`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Lấy chi tiết order theo id (admin business)
export const getOrderById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/orders/${id}/detail`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id, orderStatus) => {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${API_URL}/orders/update-order-status/${id}`,
      { orderStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${API_URL}/orders/update-payment-status/${id}`,
      { paymentStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export orders to Excel
export const exportOrdersToExcel = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/orders/export/excel`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Các hàm PayOS
export const payosCheckoutSuccess = async (orderId) => {
  const token = getToken();
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  return axios.get(`${API_URL}/orders/payos/success/${orderId}`, config);
};

export const payosCheckoutCancel = async (orderId) => {
  const token = getToken();
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  return axios.get(`${API_URL}/orders/payos/cancel/${orderId}`, config);
};

// Create a new order
export const createOrderAPI = async (orderDetails) => {
  const token = getToken();
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.post(`${API_URL}/orders`, orderDetails, config);
};

// Fetch order history (paginated)
export const fetchOrderHistoryAPI = async ({ page = 1, limit = 10 } = {}) => {
  const token = getToken();
  const config = {
    headers: { "Content-Type": "application/json" },
    params: { page, limit },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.get(`${API_URL}/orders`, config);
};

// Fetch order detail by ID
export const fetchOrderDetailAPI = async (orderId) => {
  const token = getToken();
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return axios.get(`${API_URL}/orders/${orderId}`, config);
};

// Also export as default for backward compatibility
export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  exportOrdersToExcel,
  payosCheckoutSuccess,
  payosCheckoutCancel,
  createOrderAPI,
  fetchOrderHistoryAPI,
  fetchOrderDetailAPI,
};
