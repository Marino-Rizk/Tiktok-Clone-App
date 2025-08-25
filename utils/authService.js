import { api, API_ENDPOINTS } from './api';
import { getStorage, setStorage, removeStorage } from '../store/mainStorage';
import { setAccessToken as setVolatileToken, getAccessToken as getVolatileToken, clearAccessToken as clearVolatileToken } from './tokenStore';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

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

export const loginUser = async (credentials) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      
      // Store refresh token and user data; keep access token in memory only
      setVolatileToken(accessToken);
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

export const verifyToken = async (token = null) => {
  try {
    // Prefer in-memory token
    const tokenToVerify = token || getVolatileToken();
    
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

    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_TOKEN, { token: tokenToVerify });

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

    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { token: tokenToRefresh });

    if (response.success) {
      const { accessToken, refreshToken: newRefreshToken, user } = response.data;
      
      // Update in-memory access token and stored refresh token + user
      setVolatileToken(accessToken);
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

export const logoutUser = async () => {
  try {
    await clearAuthData();
    clearVolatileToken();
    
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

export const getCurrentUser = async () => {
  try {
    const userData = await getStorage(TOKEN_KEYS.USER_DATA);
    return userData;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

export const getAccessToken = async () => {
  try {
    return getVolatileToken();
  } catch (error) {
    console.warn('Failed to get access token:', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    return await getStorage(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.warn('Failed to get refresh token:', error);
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const refreshToken = await getStorage(TOKEN_KEYS.REFRESH_TOKEN);
    return !!refreshToken;
  } catch (error) {
    console.warn('Failed to check authentication status:', error);
    return false;
  }
};

const clearAuthData = async () => {
  try {
    await removeStorage(TOKEN_KEYS.REFRESH_TOKEN);
    await removeStorage(TOKEN_KEYS.USER_DATA);
  } catch (error) {
    console.warn('Failed to clear auth data:', error);
  }
};

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