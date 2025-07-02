import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const productService = {
    getAllBooks: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/products`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get product by ID
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get featured books for homepage
    getFeaturedBooks: async (limit = 8) => {
        try {
            const response = await axios.get(`${API_URL}/books/featured`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get new arrival books for homepage
    getNewArrivalBooks: async (limit = 8) => {
        try {
            const response = await axios.get(`${API_URL}/books/new-arrivals`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Search books
    searchBooks: async (query, params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/books/search`, {
                params: { query, ...params }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

}

export default productService;
