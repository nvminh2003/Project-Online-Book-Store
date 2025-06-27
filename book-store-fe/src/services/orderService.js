import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

export const payosCheckoutSuccess = async (orderId) => {
  return axios.get(`${API_URL}/orders/payos/success/${orderId}`);
};

export const payosCheckoutCancel = async (orderId) => {
  return axios.get(`${API_URL}/orders/payos/cancel/${orderId}`);
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
