import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const accountService = {
    // Register
    register: async (userData) => {
        try {
            const response = await apiClient.post(`${API_URL}/accounts/register`, userData);
            if (response.data.status === "Success") {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                return response.data;
            }
            throw new Error(response.data.message);
        } catch (error) {
            throw error;
        }
    },

    // Login
    login: async (credentials) => {
        try {
            const response = await apiClient.post(`${API_URL}/accounts/login`, credentials);
            if (response.data.status === "Success") {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                return response.data;
            }
            throw new Error(response.data.message);
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await apiClient.post(`${API_URL}/accounts/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Refresh Token
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await apiClient.post(`${API_URL}/accounts/refresh-token`, { refreshToken });
            if (response.data.status === "Success") {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                return response.data;
            }
            throw new Error(response.data.message);
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    getCurrentUser: () => {
        // Ưu tiên lấy user từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                // Nếu lỗi thì xóa user lỗi khỏi localStorage
                localStorage.removeItem('user');
            }
        }
        // Nếu không có user, fallback lấy từ accessToken (chỉ có id, email, role)
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    },

    // Get profile from backend
    getProfile: async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.get(`${API_URL}/accounts/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi lấy thông tin profile');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi lấy thông tin profile');
            }
            throw error;
        }
    },

    // Update profile
    updateProfile: async (payload) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.put(`${API_URL}/accounts/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi cập nhật profile');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi cập nhật profile');
            }
            throw error;
        }
    },

    // Change password
    changePassword: async ({ oldPassword, newPassword }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.put(`${API_URL}/accounts/change-password`, { oldPassword, newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi đổi mật khẩu');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi đổi mật khẩu');
            }
            throw error;
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post(`${API_URL}/accounts/forgot-password`, { email });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi gửi yêu cầu quên mật khẩu');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi gửi yêu cầu quên mật khẩu');
            }
            throw error;
        }
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        try {
            const response = await apiClient.post(`${API_URL}/accounts/reset-password`, { token, newPassword });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi đặt lại mật khẩu');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi đặt lại mật khẩu');
            }
            throw error;
        }
    },

    // Get all users with search and filters
    getAllUsers: async (params = {}) => {
        try {
            const token = localStorage.getItem('accessToken');
            const queryString = new URLSearchParams({
                ...params,
                _t: Date.now() // Add timestamp to prevent caching
            }).toString();

            const response = await apiClient.get(`${API_URL}/accounts?${queryString}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi lấy danh sách người dùng');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi lấy danh sách người dùng');
            }
            throw error;
        }
    },

    // Thêm vào accountService.js
    updateUser: async (userId, userData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.put(`${API_URL}/accounts/${userId}`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi cập nhật người dùng');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi cập nhật người dùng');
            }
            throw error;
        }
    },

    //delete 
    deleteUser: async (userId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.delete(`${API_URL}/accounts/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'Success') {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi xóa người dùng');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi xóa người dùng');
            }
            throw error;
        }
    },

    // Create account by Admin
    createAccountByAdmin: async (userData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.post(`${API_URL}/accounts/admin/create`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === "Success") {
                return response.data;
            }
            throw new Error(response.data.message || 'Lỗi tạo tài khoản');
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Lỗi tạo tài khoản');
            }
            throw error;
        }
    }
};

export default accountService;
