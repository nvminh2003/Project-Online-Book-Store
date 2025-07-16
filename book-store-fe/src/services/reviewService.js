import axios from "axios";
import apiClient from './apiClient';

const API_URL =
    process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getToken = () => localStorage.getItem('accessToken') || localStorage.getItem('access_token');

const reviewService = {
    // Tạo đánh giá mới (Customer only)
    createReview: async (reviewData) => {
        try {
            const response = await apiClient.post(`${API_URL}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh sách đánh giá theo sách (Public)
    getReviewsByBook: async (bookId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/book/${bookId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy đánh giá của khách hàng (Customer only)
    getMyReviews: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/my-reviews`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật đánh giá (Customer only)
    updateReview: async (reviewId, updateData) => {
        try {
            const response = await apiClient.put(`${API_URL}/reviews/${reviewId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xóa đánh giá (Customer own reviews hoặc AdminBusiness)
    deleteReview: async (reviewId) => {
        try {
            const response = await apiClient.delete(`${API_URL}/reviews/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy tất cả đánh giá (AdminBusiness only)
    getAllReviews: async (page = 1, limit = 10, filters = {}) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: {
                    page,
                    limit,
                    ...filters // status, bookId, userId, rating
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Ẩn/Hiện đánh giá (AdminBusiness only)
    toggleReviewVisibility: async (reviewId) => {
        try {
            const response = await apiClient.put(`${API_URL}/reviews/${reviewId}/visibility`, {}, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Helper function để lọc đánh giá theo rating (AdminBusiness)
    getReviewsByRating: async (rating, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: {
                    page,
                    limit,
                    rating
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Helper function để lấy đánh giá bị ẩn (AdminBusiness)
    getHiddenReviews: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: {
                    page,
                    limit,
                    status: 'hidden'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Helper function để lấy đánh giá hiển thị (AdminBusiness)
    getVisibleReviews: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: {
                    page,
                    limit,
                    status: 'visible'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy review theo orderId và bookId (dùng cho OrderDetailPage, ReviewForm)
    getReviewByOrderAndBook: async (orderId, bookId) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/my-reviews`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: { orderId, bookId }
            });
            // Trả về review đầu tiên nếu có
            if (response.data && response.data.data && response.data.data.reviews && response.data.data.reviews.length > 0) {
                return response.data.data.reviews[0];
            }
            return null;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy 1 đánh giá theo reviewId (Customer only)
    getReviewById: async (reviewId) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy đánh giá nổi bật cho homepage (Public)
    getFeaturedReviews: async (limit = 4) => {
        try {
            const response = await apiClient.get(`${API_URL}/reviews/featured`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default reviewService;