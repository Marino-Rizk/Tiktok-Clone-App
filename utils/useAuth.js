import { useState, useEffect, useCallback } from 'react';
import { 
  verifyToken, 
  refreshToken, 
  getCurrentUser, 
  isAuthenticated,
  logoutUser 
} from './authService';

/**
 * Custom hook for managing authentication state
 * Provides automatic token verification and refresh
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated and verify token
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have stored tokens
      const hasTokens = await isAuthenticated();
      
      if (!hasTokens) {
        setUser(null);
        setIsAuthenticatedState(false);
        return;
      }

      // Verify the current token
      const verifyResult = await verifyToken();
      
      if (verifyResult.success) {
        setUser(verifyResult.data);
        setIsAuthenticatedState(true);
      } else {
        // Token is invalid, try to refresh
        const refreshResult = await refreshToken();
        
        if (refreshResult.success) {
          setUser(refreshResult.data.user);
          setIsAuthenticatedState(true);
        } else {
          // Refresh failed, user needs to login again
          await logoutUser();
          setUser(null);
          setIsAuthenticatedState(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticatedState(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticatedState(!!userData);
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticatedState(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  /**
   * Refresh authentication status
   */
  const refreshAuth = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticatedState,
    updateUser,
    logout,
    refreshAuth,
    checkAuthStatus
  };
};

/**
 * Hook for automatic token refresh
 * Can be used in components that need to ensure valid tokens
 */
export const useTokenRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTokenIfNeeded = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Verify current token
      const verifyResult = await verifyToken();
      
      if (!verifyResult.success) {
        // Token is invalid, try to refresh
        const refreshResult = await refreshToken();
        
        if (!refreshResult.success) {
          // Refresh failed, user needs to login again
          await logoutUser();
          return {
            success: false,
            needsLogin: true,
            message: 'Session expired, please login again'
          };
        }
        
        return {
          success: true,
          message: 'Token refreshed successfully'
        };
      }
      
      return {
        success: true,
        message: 'Token is valid'
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        needsLogin: true,
        message: 'Authentication error, please login again'
      };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    isRefreshing,
    refreshTokenIfNeeded
  };
};

/**
 * Hook for protected routes
 * Automatically redirects to login if not authenticated
 */
export const useProtectedRoute = (navigation) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login
      navigation?.replace('/auth/LoginScreen');
    }
  }, [isLoading, isAuthenticated, navigation]);

  return {
    user,
    isLoading,
    isAuthenticated
  };
}; 