import axios from "axios";
import apiClient from './apiClient';

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
    return apiClient.get(`${API_BASE_URL}/cart`);
};

export const addItemToCartAPI = async (bookId, quantity) => {
    return apiClient.post(
        `${API_BASE_URL}/cart/add`,
        {
            items: [{ bookId, quantity }],
        }
    );
};

export const updateCartItemQuantityAPI = async (bookId, quantity) => {
    return apiClient.put(
        `${API_BASE_URL}/cart/items/${bookId}`,
        { quantity }
    );
};

export const removeCartItemAPI = async (bookId) => {
    return apiClient.delete(`${API_BASE_URL}/cart/items/${bookId}`);
};

export const applyCouponToCartAPI = async (couponCode) => {
    return apiClient.post(
        `${API_BASE_URL}/cart/coupon`,
        { couponCode }
    );
};

export const clearCartAPI = async () => {
    return apiClient.delete(`${API_BASE_URL}/cart/clear`);
};