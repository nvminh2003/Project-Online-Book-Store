import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

export const payosCheckoutSuccess = async (orderId) => {
  return axios.get(`${API_URL}/orders/payos/success/${orderId}`);
};

export const payosCheckoutCancel = async (orderId) => {
  return axios.get(`${API_URL}/orders/payos/cancel/${orderId}`);
};
