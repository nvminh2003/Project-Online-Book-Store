import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const adminService = {
    // Get all admin activities
    getAdminActivities: async (page = 1, limit = 10) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await apiClient.get(`${API_URL}/admin/activities`, {
                params: { page, limit, _t: Date.now() },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi lấy danh sách hoạt động admin');
            }
            throw error;
        }
    },

    // Get admin activities by date range
    getAdminActivitiesByDateRange: async (startDate, endDate, page = 1, limit = 10) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await apiClient.get(`${API_URL}/admin/activities/date-range`, {
                params: { startDate, endDate, page, limit, _t: Date.now() },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi lấy hoạt động theo khoảng thời gian');
            }
            throw error;
        }
    },

    // Search activities
    searchActivities: async (searchTerm, page = 1, limit = 10) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await apiClient.get(`${API_URL}/admin/activities/search`, {
                params: { searchTerm, page, limit, _t: Date.now() },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Lỗi tìm kiếm hoạt động');
            }
            throw error;
        }
    }
};

export default adminService; 