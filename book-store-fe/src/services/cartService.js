import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getAuthToken = () => localStorage.getItem("accessToken");
const getAxiosConfig = () => {
  const token = getAuthToken();
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};

export const fetchCartAPI = async () => {
  return axios.get(`${API_BASE_URL}/cart`, getAxiosConfig());
};

export const addItemToCartAPI = async (bookId, quantity) => {
  return axios.post(
    `${API_BASE_URL}/cart/add`,
    {
      items: [{ bookId, quantity }],
    },
    getAxiosConfig()
  );
};

export const updateCartItemQuantityAPI = async (bookId, quantity) => {
  return axios.put(
    `${API_BASE_URL}/cart/items/${bookId}`,
    { quantity },
    getAxiosConfig()
  );
};

export const removeCartItemAPI = async (bookId) => {
  return axios.delete(`${API_BASE_URL}/cart/items/${bookId}`, getAxiosConfig());
};

export const applyCouponToCartAPI = async (couponCode) => {
  return axios.post(
    `${API_BASE_URL}/cart/coupon`,
    { couponCode },
    getAxiosConfig()
  );
};

export const clearCartAPI = async () => {
  return axios.delete(`${API_BASE_URL}/cart/clear`, getAxiosConfig());
};
