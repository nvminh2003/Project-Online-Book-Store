import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const saleReportService = {
    // Tổng quan doanh số
    getOverview: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/overview`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // Dữ liệu biểu đồ doanh thu
    getChart: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/chart`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // Sản phẩm bán chạy
    getBestSellers: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/best-sellers`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // Doanh thu theo danh mục
    getCategorySales: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/category`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    // Top khách hàng
    getTopCustomers: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/top-customers`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log("✅ [saleReportService] topCustomers response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ [saleReportService] getTopCustomers failed:", error);
            console.error("👉 Full error:", error?.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // Đơn hàng gần đây
    getRecentOrders: async (params = {}) => {
        try {
            const token = getToken();
            const response = await apiClient.get(`${API_URL}/sales-report/recent-orders`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Danh sách tài khoản (nếu cần thiết)
    getAllCustomer: async (params = {}) => {
        try {
            const token = localStorage.getItem('accessToken');
            const queryString = new URLSearchParams({
                ...params,
                _t: Date.now() // Add timestamp to prevent caching
            }).toString();

            const response = await apiClient.get(`${API_URL}/sales-report/get-customer?${queryString}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log("✅ getAllCustomer:", response.data);
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
};

export default saleReportService;
