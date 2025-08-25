import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from './userService';
import { getStorage, setStorage } from '../store/mainStorage';

/**
 * Custom hook for managing user state and operations
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserProfile();
      
      if (response.success) {
        setUser(response.data);
        
        // Cache the user data
        await setStorage('currentUser', response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);

      const response = await updateUserProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
        
        // Update cached user data
        await setStorage('currentUser', response.data);
        
        return { success: true, data: response.data };
      } else {
        setError(response.error.message);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const error = { message: 'Failed to update profile' };
      setError(error.message);
      return { success: false, error };
    }
  }, []);

  // Clear user data
  const clearUser = useCallback(async () => {
    setUser(null);
    setError(null);
    await setStorage('currentUser', null);
  }, []);

  // Load cached user data on mount
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const cachedUser = await getStorage('currentUser');
        if (cachedUser) {
          setUser(cachedUser);
        }
      } catch (err) {
        console.warn('Failed to load cached user:', err);
      } finally {
        // Always try to load fresh data
        await loadUserProfile();
      }
    };

    loadCachedUser();
  }, [loadUserProfile]);

  return {
    user,
    loading,
    error,
    loadUserProfile,
    updateProfile,
    clearUser,
    isAuthenticated: !!user,
  };
};

export default useUser; 