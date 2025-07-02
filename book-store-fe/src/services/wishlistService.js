import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL_BACKEND || "http://localhost:9999/api";

const getAxiosConfig = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const wishlistService = {
  // Get wishlist with pagination and filters
  getWishlist: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE_URL}/wishlist${queryParams ? `?${queryParams}` : ""}`,
      getAxiosConfig()
    );
    return response.data;
  },

  // Get wishlist summary/statistics
  getWishlistSummary: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/wishlist/summary`,
      getAxiosConfig()
    );
    return response.data;
  },

  // Add book to wishlist
  addToWishlist: async (bookId) => {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/add`,
      { bookId },
      getAxiosConfig()
    );
    return response.data;
  },

  // Remove book from wishlist
  removeFromWishlist: async (bookId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/wishlist/remove/${bookId}`,
      getAxiosConfig()
    );
    return response.data;
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    const response = await axios.delete(
      `${API_BASE_URL}/wishlist/clear`,
      getAxiosConfig()
    );
    return response.data;
  },

  // Check if book is in wishlist
  checkBookInWishlist: async (bookId) => {
    const response = await axios.get(
      `${API_BASE_URL}/wishlist/check/${bookId}`,
      getAxiosConfig()
    );
    return response.data;
  },

  // Move book from wishlist to cart
  moveToCart: async (bookId, quantity = 1) => {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/move-to-cart`,
      { bookId, quantity },
      getAxiosConfig()
    );
    return response.data;
  },

  // Move multiple books to cart
  moveMultipleToCart: async (bookIds) => {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/move-multiple-to-cart`,
      { bookIds },
      getAxiosConfig()
    );
    return response.data;
  },

  // Remove multiple books from wishlist
  removeMultipleFromWishlist: async (bookIds) => {
    const response = await axios.delete(
      `${API_BASE_URL}/wishlist/remove-multiple`,
      { data: { bookIds }, ...getAxiosConfig() }
    );
    return response.data;
  },
};

export default wishlistService;
