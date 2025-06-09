import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:3000/api';

const accountService = {
    // Register
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/accounts/register`, userData);
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
            const response = await axios.post(`${API_URL}/accounts/login`, credentials);
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
            await axios.post(`${API_URL}/accounts/logout`, {}, {
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
            const response = await axios.post(`${API_URL}/accounts/refresh-token`, { refreshToken });
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
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/accounts/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'Success') {
            return response.data;
        }
        throw new Error(response.data.message || 'Lỗi lấy thông tin profile');
    },

    // Update profile
    updateProfile: async (payload) => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(`${API_URL}/accounts/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'Success') {
            return response.data;
        }
        throw new Error(response.data.message || 'Lỗi cập nhật profile');
    },

    // Change password
    changePassword: async ({ oldPassword, newPassword }) => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(`${API_URL}/accounts/change-password`, { oldPassword, newPassword }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'Success') {
            return response.data;
        }
        throw new Error(response.data.message || 'Lỗi đổi mật khẩu');
    }
};

export default accountService;
