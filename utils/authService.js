import { api, API_ENDPOINTS } from './api';
import { getStorage, setStorage, removeStorage } from '../store/mainStorage';

/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.userName - Username (min 3 characters)
 * @param {string} userData.email - Valid email address
 * @param {string} userData.password - Password (min 8 characters, must contain number)
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Registration failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Registration failed',
        status: error.status || 500
      },
      message: 'Registration failed'
    };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with tokens and user data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens and user data
      await setStorage(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      await setStorage(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      await setStorage(TOKEN_KEYS.USER_DATA, user);

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user
        },
        message: 'Login successful'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Login failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Login failed',
        status: error.status || 500
      },
      message: 'Login failed'
    };
  }
};

/**
 * Verify if the current token is valid
 * @param {string} token - Access token to verify (optional, uses stored token if not provided)
 * @returns {Promise<Object>} Verification response with user data
 */
export const verifyToken = async (token = null) => {
  try {
    // If no token provided, get from storage
    const tokenToVerify = token || await getStorage(TOKEN_KEYS.ACCESS_TOKEN);
    
    if (!tokenToVerify) {
      return {
        success: false,
        error: {
          message: 'No token found',
          status: 401
        },
        message: 'No authentication token found'
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
      token: tokenToVerify
    });

    if (response.success) {
      // Update stored user data
      await setStorage(TOKEN_KEYS.USER_DATA, response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Token is valid'
      };
    } else {
      // Token is invalid, clear stored data
      await clearAuthData();
      
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Token verification failed'
      };
    }
  } catch (error) {
    // Clear stored data on error
    await clearAuthData();
    
    return {
      success: false,
      error: {
        message: error.message || 'Token verification failed',
        status: error.status || 500
      },
      message: 'Token verification failed'
    };
  }
};

/**
 * Refresh the access token using refresh token
 * @param {string} refreshToken - Refresh token (optional, uses stored token if not provided)
 * @returns {Promise<Object>} Refresh response with new tokens
 */
export const refreshToken = async (refreshTokenParam = null) => {
  try {
    // If no refresh token provided, get from storage
    const tokenToRefresh = refreshTokenParam || await getStorage(TOKEN_KEYS.REFRESH_TOKEN);
    
    if (!tokenToRefresh) {
      return {
        success: false,
        error: {
          message: 'No refresh token found',
          status: 401
        },
        message: 'No refresh token found'
      };
    }

    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      token: tokenToRefresh
    });

    if (response.success) {
      const { accessToken, refreshToken: newRefreshToken, user } = response.data;
      
      // Update stored tokens and user data
      await setStorage(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      await setStorage(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);
      await setStorage(TOKEN_KEYS.USER_DATA, user);

      return {
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          user
        },
        message: 'Token refreshed successfully'
      };
    } else {
      // Refresh failed, clear stored data
      await clearAuthData();
      
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Token refresh failed'
      };
    }
  } catch (error) {
    // Clear stored data on error
    await clearAuthData();
    
    return {
      success: false,
      error: {
        message: error.message || 'Token refresh failed',
        status: error.status || 500
      },
      message: 'Token refresh failed'
    };
  }
};

/**
 * Logout user by clearing stored authentication data
 * @returns {Promise<Object>} Logout response
 */
export const logoutUser = async () => {
  try {
    await clearAuthData();
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Logout failed',
        status: 500
      },
      message: 'Logout failed'
    };
  }
};

/**
 * Get current user data from storage
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getCurrentUser = async () => {
  try {
    const userData = await getStorage(TOKEN_KEYS.USER_DATA);
    return userData;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

/**
 * Get stored access token
 * @returns {Promise<string|null>} Access token or null if not found
 */
export const getAccessToken = async () => {
  try {
    return await getStorage(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('Failed to get access token:', error);
    return null;
  }
};

/**
 * Get stored refresh token
 * @returns {Promise<string|null>} Refresh token or null if not found
 */
export const getRefreshToken = async () => {
  try {
    return await getStorage(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.warn('Failed to get refresh token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user has valid tokens
 */
export const isAuthenticated = async () => {
  try {
    const accessToken = await getStorage(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = await getStorage(TOKEN_KEYS.REFRESH_TOKEN);
    
    return !!(accessToken && refreshToken);
  } catch (error) {
    console.warn('Failed to check authentication status:', error);
    return false;
  }
};

/**
 * Clear all stored authentication data
 * @returns {Promise<void>}
 */
const clearAuthData = async () => {
  try {
    await removeStorage(TOKEN_KEYS.ACCESS_TOKEN);
    await removeStorage(TOKEN_KEYS.REFRESH_TOKEN);
    await removeStorage(TOKEN_KEYS.USER_DATA);
  } catch (error) {
    console.warn('Failed to clear auth data:', error);
  }
};

/**
 * Auto-refresh token when it expires
 * @returns {Promise<Object>} Refresh result
 */
export const autoRefreshToken = async () => {
  try {
    const refreshResult = await refreshToken();
    
    if (refreshResult.success) {
      return {
        success: true,
        message: 'Token auto-refreshed successfully'
      };
    } else {
      // Auto-refresh failed, user needs to login again
      await clearAuthData();
      return {
        success: false,
        message: 'Session expired, please login again'
      };
    }
  } catch (error) {
    await clearAuthData();
    return {
      success: false,
      message: 'Session expired, please login again'
    };
  }
};

/**
 * Validate user input for registration
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 */
export const validateRegistrationData = (userData) => {
  const errors = {};

  // Validate username
  if (!userData.userName || userData.userName.trim().length < 3) {
    errors.userName = 'Username must be at least 3 characters long';
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userData.email || !emailRegex.test(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  if (!userData.password || userData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/\d/.test(userData.password)) {
    errors.password = 'Password must contain at least one number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user input for login
 * @param {Object} credentials - Login credentials to validate
 * @returns {Object} Validation result
 */
export const validateLoginData = (credentials) => {
  const errors = {};

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!credentials.email || !emailRegex.test(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  if (!credentials.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export token keys for external use if needed
export { TOKEN_KEYS }; 