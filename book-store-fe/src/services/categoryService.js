import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const categoryService = {
    // Get all categories
    getAllCategories: async () => {
        try {
            const response = await apiClient.get(`${API_URL}/categories`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy danh sách danh mục';
        }
    },

    // Get category by ID
    getCategoryById: async (id) => {
        try {
            const response = await apiClient.get(`${API_URL}/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy thông tin danh mục';
        }
    },

    // Create new category
    createCategory: async (data) => {
        try {
            const response = await apiClient.post(`${API_URL}/categories`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi tạo danh mục mới';
        }
    },

    // Update category
    updateCategory: async (id, data) => {
        try {
            const response = await apiClient.put(`${API_URL}/categories/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi cập nhật danh mục';
        }
    },

    // Delete category
    deleteCategory: async (id) => {
        try {
            const response = await apiClient.delete(`${API_URL}/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi xóa danh mục';
        }
    },

    // Search categories
    searchCategories: async (searchTerm, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/categories/search`, {
                params: { searchTerm, page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi tìm kiếm danh mục';
        }
    },

    // Get categories with book count
    getCategoriesWithBookCount: async () => {
        try {
            const response = await apiClient.get(`${API_URL}/categories/with-book-count`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy danh mục với số lượng sách';
        }
    }
};

export default categoryService; 