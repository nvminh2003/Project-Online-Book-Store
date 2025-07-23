import axios from 'axios';
import apiClient from './apiClient';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const bookService = {
    // Get all books with pagination and filters
    getAllBooks: async (page = 1, limit = 10, params = {}) => {
        try {
            const response = await apiClient.get(`${API_URL}/books`, {
                params: { page, limit, ...params }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy danh sách sách';
        }
    },

    // Get book by ID
    getProductById: async (id) => {
        try {
            const response = await apiClient.get(`${API_URL}/books/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy thông tin sách';
        }
    },

    // Get featured books for homepage
    getFeaturedBooks: async (limit = 8) => {
        try {
            const response = await apiClient.get(`${API_URL}/books/featured`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy sách nổi bật';
        }
    },

    // Get new arrival books for homepage
    getNewArrivalBooks: async (limit = 8) => {
        try {
            const response = await apiClient.get(`${API_URL}/books/new-arrivals`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy sách mới';
        }
    },

    // Search books
    searchBooks: async (query, params = {}) => {
        try {
            const response = await apiClient.get(`${API_URL}/books/search`, {
                params: { query, ...params }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi tìm kiếm sách';
        }
    },

    // Create new book
    createBook: async (bookData) => {
        try {
            const response = await apiClient.post(`${API_URL}/books`, bookData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi tạo sách mới';
        }
    },

    // Update book
    updateBook: async (id, bookData) => {
        try {
            const response = await apiClient.put(`${API_URL}/books/${id}`, bookData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi cập nhật sách';
        }
    },

    // Delete book
    deleteBook: async (id) => {
        try {
            const response = await apiClient.delete(`${API_URL}/books/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi xóa sách';
        }
    },

    // Upload Excel file
    uploadExcel: async (booksData) => {
        try {
            const response = await apiClient.post(`${API_URL}/books/upload-excel`, { books: booksData });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi upload file Excel';
        }
    },

    // Get books by category
    getBooksByCategory: async (categoryId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(`${API_URL}/books/category/${categoryId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi lấy sách theo danh mục';
        }
    },

    // Update book stock
    updateBookStock: async (id, stockQuantity) => {
        try {
            const response = await apiClient.patch(`${API_URL}/books/${id}/stock`, { stockQuantity });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi cập nhật số lượng tồn kho';
        }
    },

    // Toggle book featured status
    toggleFeatured: async (id) => {
        try {
            const response = await apiClient.patch(`${API_URL}/books/${id}/featured`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi cập nhật trạng thái nổi bật';
        }
    },

    // Toggle book new arrival status
    toggleNewArrival: async (id) => {
        try {
            const response = await apiClient.patch(`${API_URL}/books/${id}/new-arrival`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Lỗi cập nhật trạng thái sách mới';
        }
    }
};

export default bookService;
