import { api, API_ENDPOINTS, uploadFile } from './api';
import { getStorage, setStorage } from '../store/mainStorage';

/**
 * User Service
 * Handles all user-related API calls including profile management, 
 * following/followers, and user search functionality
 */

/**
 * Get user profile
 * @param {Object} options - Profile fetch options
 * @param {string} options.userId - User ID to fetch profile for
 * @param {string} options.userName - Username to fetch profile for
 * @returns {Promise<Object>} Profile response
 */
export const getUserProfile = async (options = {}) => {
  try {
    const params = {};
    if (options.userId) params.userId = options.userId;
    if (options.userName) params.userName = options.userName;

    const response = await api.get(API_ENDPOINTS.USER.PROFILE, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Profile fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch profile'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch profile',
        status: error.status || 500
      },
      message: 'Failed to fetch profile'
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.displayName - New display name
 * @param {Object} profileData.imageFile - Profile image file (optional)
 * @returns {Promise<Object>} Update response
 */
export const updateUserProfile = async (profileData) => {
  try {
    let response;

    if (profileData.imageFile) {
      // Handle file upload with profile update
      const formData = new FormData();
      formData.append('displayName', profileData.displayName || '');
      formData.append('imageUrl', {
        uri: profileData.imageFile.uri,
        type: profileData.imageFile.type || 'image/jpeg',
        name: profileData.imageFile.name || 'profile.jpg'
      });

      response = await uploadFile(API_ENDPOINTS.USER.UPDATE_PROFILE, formData);
    } else {
      // Simple profile update without image
      response = await api.post(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        displayName: profileData.displayName
      });
    }

    if (response.success) {
      // Update stored user data if this is the current user
      const currentUser = await getStorage('userData');
      if (currentUser && currentUser.id === response.data.id) {
        await setStorage('userData', {
          ...currentUser,
          ...response.data
        });
      }

      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to update profile'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update profile',
        status: error.status || 500
      },
      message: 'Failed to update profile'
    };
  }
};

/**
 * Get user followers
 * @param {Object} options - Followers fetch options
 * @param {string} options.userId - User ID to get followers for
 * @param {string} options.userName - Username to get followers for
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<Object>} Followers response
 */
export const getUserFollowers = async (options = {}) => {
  try {
    const params = {
      page: options.page || 1
    };
    
    if (options.userId) params.userId = options.userId;
    if (options.userName) params.userName = options.userName;

    const response = await api.get(API_ENDPOINTS.USER.FOLLOWERS, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Followers fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch followers'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch followers',
        status: error.status || 500
      },
      message: 'Failed to fetch followers'
    };
  }
};

/**
 * Get user following
 * @param {Object} options - Following fetch options
 * @param {string} options.userId - User ID to get following for
 * @param {string} options.userName - Username to get following for
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<Object>} Following response
 */
export const getUserFollowing = async (options = {}) => {
  try {
    const params = {
      page: options.page || 1
    };
    
    if (options.userId) params.userId = options.userId;
    if (options.userName) params.userName = options.userName;

    const response = await api.get(API_ENDPOINTS.USER.FOLLOWING, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Following fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch following'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch following',
        status: error.status || 500
      },
      message: 'Failed to fetch following'
    };
  }
};

/**
 * Follow a user
 * @param {string} userId - User ID to follow
 * @returns {Promise<Object>} Follow response
 */
export const followUser = async (userId) => {
  try {
    const response = await api.post(API_ENDPOINTS.USER.FOLLOW(userId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'User followed successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to follow user'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to follow user',
        status: error.status || 500
      },
      message: 'Failed to follow user'
    };
  }
};

/**
 * Unfollow a user
 * @param {string} userId - User ID to unfollow
 * @returns {Promise<Object>} Unfollow response
 */
export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(API_ENDPOINTS.USER.UNFOLLOW(userId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'User unfollowed successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to unfollow user'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to unfollow user',
        status: error.status || 500
      },
      message: 'Failed to unfollow user'
    };
  }
};

/**
 * Search users
 * @param {Object} options - Search options
 * @param {string} options.query - Search query
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<Object>} Search response
 */
export const searchUsers = async (options = {}) => {
  try {
    if (!options.query || !options.query.trim()) {
      return {
        success: false,
        error: {
          message: 'Search query is required',
          status: 400
        },
        message: 'Search query is required'
      };
    }

    const params = {
      q: options.query.trim(),
      page: options.page || 1
    };

    const response = await api.get(API_ENDPOINTS.USER.SEARCH, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Users found successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to search users'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to search users',
        status: error.status || 500
      },
      message: 'Failed to search users'
    };
  }
};

/**
 * Toggle follow/unfollow status for a user
 * @param {string} userId - User ID to toggle follow status
 * @param {boolean} isCurrentlyFollowing - Current follow status
 * @returns {Promise<Object>} Toggle response
 */
export const toggleFollowStatus = async (userId, isCurrentlyFollowing) => {
  try {
    const response = isCurrentlyFollowing 
      ? await unfollowUser(userId)
      : await followUser(userId);

    return {
      ...response,
      data: {
        ...response.data,
        isFollowing: !isCurrentlyFollowing
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to toggle follow status',
        status: error.status || 500
      },
      message: 'Failed to toggle follow status'
    };
  }
};

/**
 * Get current user's profile
 * @returns {Promise<Object>} Current user profile
 */
export const getCurrentUserProfile = async () => {
  return await getUserProfile();
};

/**
 * Validate profile update data
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result
 */
export const validateProfileData = (profileData) => {
  const errors = {};

  // Validate display name
  if (profileData.displayName !== undefined) {
    if (profileData.displayName.trim().length === 0) {
      errors.displayName = 'Display name cannot be empty';
    } else if (profileData.displayName.trim().length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
    }
  }

  // Validate image file if provided
  if (profileData.imageFile) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(profileData.imageFile.type)) {
      errors.imageFile = 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (profileData.imageFile.size && profileData.imageFile.size > maxSize) {
      errors.imageFile = 'Image file size must be less than 5MB';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format user data for display
 * @param {Object} userData - Raw user data from API
 * @returns {Object} Raw user data (no formatting)
 */
export const formatUserData = (userData) => {
  return userData; // Return data as-is from backend
};

/**
 * Format followers/following list data
 * @param {Array} users - Array of user objects
 * @returns {Array} Raw user list (no formatting)
 */
export const formatUserList = (users) => {
  console.log('🔍 Raw users data:', users);
  return users; // Return data as-is from backend
};

/**
 * Cache user profile data
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to cache
 * @returns {Promise<void>}
 */
export const cacheUserProfile = async (userId, profileData) => {
  try {
    const cacheKey = `user_profile_${userId}`;
    await setStorage(cacheKey, {
      data: profileData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn('Failed to cache user profile:', error);
  }
};

/**
 * Get cached user profile data
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Cached profile data or null
 */
export const getCachedUserProfile = async (userId) => {
  try {
    const cacheKey = `user_profile_${userId}`;
    const cached = await getStorage(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
      return cached.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get cached user profile:', error);
    return null;
  }
};

/**
 * Clear cached user profile data
 * @param {string} userId - User ID (optional, clears all if not provided)
 * @returns {Promise<void>}
 */
export const clearCachedUserProfile = async (userId = null) => {
  try {
    if (userId) {
      const cacheKey = `user_profile_${userId}`;
      await setStorage(cacheKey, null);
    } else {
      // Clear all user profile caches
      // This would require a more sophisticated cache management system
      console.warn('Clearing all user profile caches not implemented');
    }
  } catch (error) {
    console.warn('Failed to clear cached user profile:', error);
  }
};

// Export all functions
export default {
  getUserProfile,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
  searchUsers,
  toggleFollowStatus,
  getCurrentUserProfile,
  validateProfileData,
  formatUserData,
  formatUserList,
  cacheUserProfile,
  getCachedUserProfile,
  clearCachedUserProfile
}; 