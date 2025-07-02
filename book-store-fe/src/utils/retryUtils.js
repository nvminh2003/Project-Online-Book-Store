// src/utils/retryUtils.js

/**
 * Utility function to retry async operations with exponential backoff
 */
export const retryAsync = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  exponential = true
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain types of errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay for next attempt
      const delay = exponential ? baseDelay * Math.pow(2, attempt) : baseDelay;

      // Add some jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;

      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay + jitter}ms:`,
        error.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
};

/**
 * Determine if an error should not be retried
 */
const isNonRetryableError = (error) => {
  // Don't retry on 4xx errors (client errors) except for specific cases
  if (error.response?.status >= 400 && error.response?.status < 500) {
    // Retry on 408 (timeout), 429 (rate limit)
    return ![408, 429].includes(error.response.status);
  }

  // Don't retry on validation errors
  if (
    error.message?.includes("validation") ||
    error.message?.includes("invalid")
  ) {
    return true;
  }

  return false;
};

/**
 * Wrapper for API calls with automatic retry logic
 */
export const withRetry = (apiFunction, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    exponential = true,
    onRetry = null,
  } = options;

  return async (...args) => {
    return retryAsync(
      () => apiFunction(...args),
      maxRetries,
      baseDelay,
      exponential
    );
  };
};

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return this.state;
  }
}

/**
 * Cache with TTL (Time To Live) support
 */
export class TTLCache {
  constructor(defaultTTL = 300000) {
    // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Enhanced API client with retry and caching
 */
export const createResilientApiClient = (baseConfig = {}) => {
  const cache = new TTLCache();
  const circuitBreaker = new CircuitBreaker();

  return {
    async request(config) {
      const {
        url,
        method = "GET",
        cache: useCache = method === "GET",
        cacheTTL = 300000,
        retry = true,
        retryOptions = {},
        ...requestConfig
      } = { ...baseConfig, ...config };

      // Generate cache key
      const cacheKey = useCache
        ? `${method}:${url}:${JSON.stringify(requestConfig)}`
        : null;

      // Check cache first
      if (cacheKey && cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      // Create the actual request function
      const makeRequest = async () => {
        return circuitBreaker.execute(async () => {
          // Here you would integrate with your actual HTTP client (axios, fetch, etc.)
          const response = await fetch(url, {
            method,
            ...requestConfig,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        });
      };

      // Execute request with retry if enabled
      const result = retry
        ? await retryAsync(
            makeRequest,
            retryOptions.maxRetries,
            retryOptions.baseDelay
          )
        : await makeRequest();

      // Cache successful GET requests
      if (cacheKey && method === "GET") {
        cache.set(cacheKey, result, cacheTTL);
      }

      return result;
    },

    // Convenience methods
    get: (url, config = {}) => this.request({ ...config, url, method: "GET" }),
    post: (url, data, config = {}) =>
      this.request({
        ...config,
        url,
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (url, data, config = {}) =>
      this.request({
        ...config,
        url,
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (url, config = {}) =>
      this.request({ ...config, url, method: "DELETE" }),

    // Cache management
    clearCache: () => cache.clear(),
    getCircuitBreakerState: () => circuitBreaker.getState(),
  };
};

export default {
  retryAsync,
  withRetry,
  CircuitBreaker,
  TTLCache,
  createResilientApiClient,
};
