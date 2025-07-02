import axios from "axios";
import { withRetry, TTLCache } from "../utils/retryUtils";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:9999/api";

// Create a cache for discount codes
const discountCache = new TTLCache(300000); // 5 minutes cache

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all discount codes with filtering and pagination (with retry)
export const getDiscountCodesAPI = withRetry(
  async (params = {}) => {
    const cacheKey = `discounts:${JSON.stringify(params)}`;

    // Check cache first for read operations
    if (discountCache.has(cacheKey)) {
      return discountCache.get(cacheKey);
    }

    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/discount-codes?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Cache the result
    discountCache.set(cacheKey, response.data, 180000); // 3 minutes for list data

    return response.data;
  },
  { maxRetries: 2, baseDelay: 1000 }
);

// Get discount code by ID (with caching)
export const getDiscountCodeByIdAPI = async (id) => {
  const cacheKey = `discount:${id}`;

  if (discountCache.has(cacheKey)) {
    return discountCache.get(cacheKey);
  }

  const response = await axios.get(`${API_BASE_URL}/discount-codes/${id}`, {
    headers: getAuthHeaders(),
  });

  // Cache individual discount code for longer
  discountCache.set(cacheKey, response.data, 600000); // 10 minutes

  return response.data;
};

// Create new discount code (Admin only)
export const createDiscountCodeAPI = async (discountData) => {
  const response = await axios.post(
    `${API_BASE_URL}/discount-codes`,
    discountData,
    { headers: getAuthHeaders() }
  );

  // Clear cache after create
  discountCache.clear();

  return response.data;
};

// Update discount code (Admin only)
export const updateDiscountCodeAPI = async (id, discountData) => {
  const response = await axios.put(
    `${API_BASE_URL}/discount-codes/${id}`,
    discountData,
    { headers: getAuthHeaders() }
  );

  // Clear cache after update
  discountCache.clear();

  return response.data;
};

// Delete discount code (Admin only)
export const deleteDiscountCodeAPI = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/discount-codes/${id}`, {
    headers: getAuthHeaders(),
  });

  // Clear cache after delete
  discountCache.clear();

  return response.data;
};

// Validate discount code (with retry and short-term caching)
export const validateDiscountCodeAPI = withRetry(
  async (code, items = []) => {
    const cacheKey = `validate:${code}:${JSON.stringify(items)}`;

    // Short cache for validation (1 minute) to prevent spam
    if (discountCache.has(cacheKey)) {
      return discountCache.get(cacheKey);
    }

    const response = await axios.post(
      `${API_BASE_URL}/discount-codes/validate`,
      {
        code,
        items,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    // Only cache successful validations briefly
    if (response.data.valid) {
      discountCache.set(cacheKey, response.data, 60000); // 1 minute
    }

    return response.data;
  },
  { maxRetries: 1, baseDelay: 500 }
);

// Apply discount code (Authenticated users) - no retry for state-changing operations
export const applyDiscountCodeAPI = async (code, items = []) => {
  // Clear cache when applying discount
  discountCache.clear();

  const response = await axios.post(
    `${API_BASE_URL}/discount-codes/apply`,
    { code, items },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get discount analytics (Admin only)
export const getDiscountAnalyticsAPI = async (id, period = "30d") => {
  const response = await axios.get(
    `${API_BASE_URL}/discount-codes/${id}/analytics?period=${period}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Bulk operations on discount codes (Admin only)
export const bulkUpdateDiscountCodesAPI = async (
  ids,
  action,
  updateData = null
) => {
  const response = await axios.post(
    `${API_BASE_URL}/discount-codes/bulk`,
    { ids, action, updateData },
    { headers: getAuthHeaders() }
  );

  // Clear cache after bulk update
  discountCache.clear();

  return response.data;
};

// Auto-generate discount codes (Admin only)
export const generateDiscountCodesAPI = async (generationData) => {
  const response = await axios.post(
    `${API_BASE_URL}/discount-codes/generate`,
    { ...generationData, autoGenerate: true },
    { headers: getAuthHeaders() }
  );

  // Clear cache after generating codes
  discountCache.clear();

  return response.data;
};

// Get discount code usage statistics
export const getDiscountStatisticsAPI = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/discount-codes?statistics=true`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Cache management functions
export const clearDiscountCache = () => {
  discountCache.clear();
};

export const getDiscountCacheInfo = () => {
  return {
    size: discountCache.cache.size,
    keys: Array.from(discountCache.cache.keys()),
  };
};

export default {
  getDiscountCodesAPI,
  getDiscountCodeByIdAPI,
  createDiscountCodeAPI,
  updateDiscountCodeAPI,
  deleteDiscountCodeAPI,
  validateDiscountCodeAPI,
  applyDiscountCodeAPI,
  getDiscountAnalyticsAPI,
  bulkUpdateDiscountCodesAPI,
  generateDiscountCodesAPI,
  getDiscountStatisticsAPI,
  clearDiscountCache,
  getDiscountCacheInfo,
};
