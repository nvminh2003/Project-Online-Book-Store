import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const blogService = {
    // Get all blogs with flexible params (page, limit, status, createdAt, from, to)
    getAllBlogs: async (params = {}) => {
        try {
            const response = await apiClient.get(`${API_URL}/blogs`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get blog by ID
    getBlogById: async (id) => {
        try {
            const response = await apiClient.get(`${API_URL}/blogs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Search blogs
    searchBlogs: async (searchTerm, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/blogs/search`, {
                params: { searchTerm, page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy blog theo khoảng ngày tạo (dành cho admin)
    getBlogsByDateRange: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/blogs/date-range`, {
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

    // Create blog (Admin only)
    createBlog: async (blogData) => {
        try {
            const token = getToken();
            const response = await apiClient.post(`${API_URL}/blogs`, blogData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update blog (Admin only)
    updateBlog: async (id, blogData) => {
        try {
            const token = getToken();
            const response = await apiClient.put(`${API_URL}/blogs/${id}`, blogData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete blog (Admin only)
    deleteBlog: async (id) => {
        try {
            const token = getToken();
            const response = await apiClient.delete(`${API_URL}/blogs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default blogService; 