import axios from "axios";
import { getStorage } from "../store/mainStorage";

  // Configuration
  const API_CONFIG = {
    baseURL: "http://192.168.1.12:4000/api/v1",
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
  };

// API Endpoints - Centralized for easy maintenance
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY_TOKEN: "/auth/verifyToken",
    REFRESH_TOKEN: "/auth/refreshToken",
    //FORGOT_PASSWORD: "/auth/forgotPassword",
    //RESET_PASSWORD: "/auth/resetPassword",
  },
  
  // User endpoints
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/update",
    FOLLOWERS: "/user/followers",
    FOLLOWING: "/user/following",
    FOLLOW: (userId) => `/user/${userId}/follow`,
    UNFOLLOW: (userId) => `/user/${userId}/unfollow`,
    SEARCH: "/user/search",
  },
  
  // Video endpoints
  VIDEO: {
    UPLOAD: "/video/upload",
    USER_VIDEOS: "/video/user",
    USER_VIDEOS_BY_ID: (userId) => `/video/user/${userId}`,
    VIEW: (videoId) => `/video/view/${videoId}`,
    LIKE: (videoId) => `/video/like/${videoId}`,
    DISLIKE: (videoId) => `/video/dislike/${videoId}`,
    COMMENT: (videoId) => `/video/comment/${videoId}`,
    GET_COMMENTS: (videoId) => `/video/comment/${videoId}`,
    RECOMMENDATIONS: "/video/recommend",
    TRENDING: "/video/trending",
    SEARCH: "/video/search",
  },
  
  // Feed endpoints
  FEED: {
    HOME: "/feed/home",
    FOR_YOU: "/feed/for-you",
    FOLLOWING: "/feed/following",
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: "/notifications/mark-read",
    SETTINGS: "/notifications/settings",
  },
};

// Request cache for offline support
const requestCache = new Map();
const pendingRequests = new Map();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStorage("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // You can dispatch a logout action here
      console.warn("Unauthorized access, redirecting to login");
      // Clear token and redirect to login
      try {
        await getStorage("token", null); // Clear token
      } catch (e) {
        console.warn("Failed to clear token:", e);
      }
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// Retry mechanism
const retryRequest = async (fn, retries = API_CONFIG.retries) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && !error.response) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Request deduplication
const getRequestKey = (method, url, data) => {
  return `${method}:${url}:${JSON.stringify(data || {})}`;
};

// Main API call function with enhanced features
export const apiCall = async (method, url, data = null, options = {}) => {
  const requestKey = getRequestKey(method, url, data);
  
  // Check if request is already pending
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }
  
  // Check cache for GET requests
  if (method.toLowerCase() === 'get' && !options.skipCache && requestCache.has(requestKey)) {
    const cached = requestCache.get(requestKey);
    if (Date.now() - cached.timestamp < (options.cacheTime || 5 * 60 * 1000)) { // 5 minutes default
      return cached.data;
    }
  }
  
  const requestPromise = (async () => {
    try {
      const config = {
        method: method.toLowerCase(),
        url,
        ...options,
      };

      // Add data based on method
      if (data) {
        if (method.toLowerCase() === "get") {
          config.params = data;
        } else {
          config.data = data;
        }
      }

      const response = await retryRequest(() => apiClient(config));
      const result = { success: true, data: response.data };
      
      // Cache GET requests
      if (method.toLowerCase() === 'get' && !options.skipCache) {
        requestCache.set(requestKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || "An error occurred",
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
        },
      };

      // Log error in development
      if (__DEV__) {
        console.error("API Error:", errorResponse);
      }

      return errorResponse;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(requestKey);
    }
  })();
  
  // Store pending request
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
};

// Convenience methods for different HTTP verbs
export const api = {
  get: (url, params, options) => apiCall("get", url, params, options),
  post: (url, data, options) => apiCall("post", url, data, options),
  put: (url, data, options) => apiCall("put", url, data, options),
  patch: (url, data, options) => apiCall("patch", url, data, options),
  delete: (url, options) => apiCall("delete", url, null, options),
};

// File upload helper with progress tracking
export const uploadFile = async (url, file, onProgress = null, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...options,
    };

    if (onProgress) {
      config.onUploadProgress = onProgress;
    }

    const response = await apiClient.post(url, formData, config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || "Upload failed",
        status: error.response?.status,
        code: error.code,
      },
    };
  }
};

// Batch upload helper for multiple files
export const uploadMultipleFiles = async (url, files, onProgress = null, options = {}) => {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...options,
    };

    if (onProgress) {
      config.onUploadProgress = onProgress;
    }

    const response = await apiClient.post(url, formData, config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || "Upload failed",
        status: error.response?.status,
        code: error.code,
      },
    };
  }
};

// Cache management utilities
export const cacheUtils = {
  clear: () => requestCache.clear(),
  clearByPattern: (pattern) => {
    for (const [key] of requestCache) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  },
  get: (key) => requestCache.get(key),
  set: (key, data, timestamp = Date.now()) => {
    requestCache.set(key, { data, timestamp });
  },
};

// Request cancellation utility
export const createCancelToken = () => axios.CancelToken.source();

// Offline queue for failed requests
const offlineQueue = [];

export const offlineUtils = {
  addToQueue: (request) => {
    offlineQueue.push(request);
  },
  processQueue: async () => {
    while (offlineQueue.length > 0) {
      const request = offlineQueue.shift();
      try {
        await apiCall(request.method, request.url, request.data, request.options);
      } catch (error) {
        console.warn("Failed to process queued request:", error);
      }
    }
  },
  getQueueLength: () => offlineQueue.length,
  clearQueue: () => offlineQueue.splice(0, offlineQueue.length),
};

// Export the axios instance for advanced usage
export { apiClient };
