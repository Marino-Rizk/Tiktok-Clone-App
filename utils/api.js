import axios from "axios";
import { getStorage, removeStorage, setStorage } from "../store/mainStorage";
import { getAccessToken as getVolatileToken, setAccessToken as setVolatileToken, clearAccessToken as clearVolatileToken, tokenRefreshState } from "./tokenStore";

const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_MAIN_URL,
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
    UPLOAD: "/videos/upload",
    USER_VIDEOS: "/videos/user",
    USER_VIDEOS_BY_ID: (userId) => `/videos/user/${userId}`,
    VIEW: (videoId) => `/videos/view/${videoId}`,
    LIKE: (videoId) => `/videos/like/${videoId}`,
    DISLIKE: (videoId) => `/videos/dislike/${videoId}`,
    COMMENT: (videoId) => `/videos/comment/${videoId}`,
    GET_COMMENTS: (videoId) => `/videos/comment/${videoId}`,
    RECOMMENDATIONS: "/videos/recommend",
    SEARCH: "/videos/search",
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
      const token = getVolatileToken();
      console.log('API Request - Token exists:', !!token);
      console.log('API Request URL:', config.url);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header added');
      } else {
        console.log('No token found for request');
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

// Helper: refresh flow orchestrator used by response interceptor
const performRefresh = async () => {
  if (tokenRefreshState.isRefreshing && tokenRefreshState.refreshPromise) {
    return tokenRefreshState.refreshPromise;
  }
  tokenRefreshState.isRefreshing = true;
  tokenRefreshState.refreshPromise = (async () => {
    try {
      const storedRefresh = await getStorage("refreshToken");
      if (!storedRefresh) throw new Error("No refresh token available");
      // Call refresh endpoint; mark request to skip refresh handling to avoid recursion
      const res = await apiClient({
        method: 'post',
        url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        data: { token: storedRefresh },
        _skipRefresh: true,
      });
      const { accessToken, refreshToken: newRefreshToken } = res.data || {};
      if (!accessToken || !newRefreshToken) throw new Error("Invalid refresh response");
      // Persist refresh token, keep access token in memory
      await setStorage("refreshToken", newRefreshToken);
      setVolatileToken(accessToken);
      return accessToken;
    } finally {
      tokenRefreshState.isRefreshing = false;
      // Keep last promise until next call; callers may still await it
    }
  })();
  return tokenRefreshState.refreshPromise;
};

// Response interceptor for global error handling with refresh+retry
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API Error:', error.response?.status, error.config?.url);
    console.log('Error details:', error.response?.data);
    
    // Handle 401 Unauthorized → attempt refresh then retry once
    const originalRequest = error.config || {};
    if (originalRequest._skipRefresh) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccess = await performRefresh();
        if (newAccess) {
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newAccess}`,
          };
          return apiClient(originalRequest);
        }
      } catch (e) {
        console.warn("Token refresh failed:", e?.message || e);
        try {
          await removeStorage("refreshToken");
          await removeStorage("userData");
        } catch {}
        clearVolatileToken();
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

// Helper: get server base (without /api/v1)
export const getServerBaseUrl = () => {
  try {
    return API_CONFIG.baseURL.replace(/\/?api\/v1\/?$/, '');
  } catch (e) {
    return API_CONFIG.baseURL;
  }
};

// Helper: build absolute URL from relative or absolute path
export const buildAbsoluteUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getServerBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

// Note: multipart upload is handled directly in videoService.uploadVideo to match backend field names

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
