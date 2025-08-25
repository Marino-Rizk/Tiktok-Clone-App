import { api, API_ENDPOINTS, apiClient } from './api';
import { getStorage, setStorage } from '../store/mainStorage';

/**
 * Video Service
 * Handles all video-related API calls including upload, recommendations, 
 * likes, comments, and search functionality
 */

/**
 * Upload a video
 * @param {Object} videoData - Video upload data
 * @param {Object} videoData.videoFile - Video file object
 * @param {Object} videoData.thumbnailFile - Thumbnail file object
 * @param {string} videoData.caption - Video caption
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise<Object>} Upload response
 */
export const uploadVideo = async (videoData, onProgress = null) => {
  try {
    const formData = new FormData();
    
    // Add video file
    formData.append('video', {
      uri: videoData.videoFile.uri,
      type: videoData.videoFile.type || 'video/mp4',
      name: videoData.videoFile.name || 'video.mp4'
    });
    
    // Add thumbnail file
    formData.append('thumbnail', {
      uri: videoData.thumbnailFile.uri,
      type: videoData.thumbnailFile.type || 'image/jpeg',
      name: videoData.thumbnailFile.name || 'thumbnail.jpg'
    });
    
    // Add caption
    if (videoData.caption) {
      formData.append('caption', videoData.caption);
    }

    const axiosResponse = await apiClient.post(
      API_ENDPOINTS.VIDEO.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...(onProgress ? { onUploadProgress: onProgress } : {}),
      }
    );

    const response = { success: true, data: axiosResponse.data };

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Video uploaded successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to upload video'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to upload video',
        status: error.status || 500
      },
      message: 'Failed to upload video'
    };
  }
};

/**
 * Get video recommendations for home feed
 * @param {Object} options - Recommendation options
 * @param {number} options.limit - Number of recommendations (default: 10)
 * @returns {Promise<Object>} Recommendations response
 */
export const getVideoRecommendations = async (options = {}) => {
  try {
    const data = {
      limit: options.limit || 10
    };

    const response = await api.post(API_ENDPOINTS.VIDEO.RECOMMENDATIONS, data);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Recommendations fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch recommendations'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch recommendations',
        status: error.status || 500
      },
      message: 'Failed to fetch recommendations'
    };
  }
};

/**
 * Get videos by user
 * @param {Object} options - User videos options
 * @param {string} options.userId - User ID (optional, uses current user if not provided)
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<Object>} User videos response
 */
export const getUserVideos = async (options = {}) => {
  try {
    const params = {
      page: options.page || 1
    };

    let endpoint = API_ENDPOINTS.VIDEO.USER_VIDEOS;
    if (options.userId) {
      endpoint = API_ENDPOINTS.VIDEO.USER_VIDEOS_BY_ID(options.userId);
    }

    const response = await api.get(endpoint, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'User videos fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch user videos'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch user videos',
        status: error.status || 500
      },
      message: 'Failed to fetch user videos'
    };
  }
};

/**
 * Like a video
 * @param {string} videoId - Video ID to like
 * @returns {Promise<Object>} Like response
 */
export const likeVideo = async (videoId) => {
  try {
    const response = await api.post(API_ENDPOINTS.VIDEO.LIKE(videoId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Video liked successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to like video'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to like video',
        status: error.status || 500
      },
      message: 'Failed to like video'
    };
  }
};

/**
 * Unlike a video
 * @param {string} videoId - Video ID to unlike
 * @returns {Promise<Object>} Unlike response
 */
export const unlikeVideo = async (videoId) => {
  try {
    const response = await api.post(API_ENDPOINTS.VIDEO.DISLIKE(videoId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Video unliked successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to unlike video'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to unlike video',
        status: error.status || 500
      },
      message: 'Failed to unlike video'
    };
  }
};

/**
 * Toggle like/unlike status for a video
 * @param {string} videoId - Video ID to toggle like status
 * @param {boolean} isCurrentlyLiked - Current like status
 * @returns {Promise<Object>} Toggle response
 */
export const toggleVideoLike = async (videoId, isCurrentlyLiked) => {
  try {
    const response = isCurrentlyLiked 
      ? await unlikeVideo(videoId)
      : await likeVideo(videoId);

    return {
      ...response,
      data: {
        ...response.data,
        isLiked: !isCurrentlyLiked
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to toggle like status',
        status: error.status || 500
      },
      message: 'Failed to toggle like status'
    };
  }
};

/**
 * Add a comment to a video
 * @param {string} videoId - Video ID to comment on
 * @param {string} commentText - Comment text
 * @returns {Promise<Object>} Comment response
 */
export const addComment = async (videoId, commentText) => {
  try {
    const response = await api.post(API_ENDPOINTS.VIDEO.COMMENT(videoId), {
      text: commentText
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Comment added successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to add comment'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to add comment',
        status: error.status || 500
      },
      message: 'Failed to add comment'
    };
  }
};

/**
 * Get comments for a video
 * @param {string} videoId - Video ID to get comments for
 * @returns {Promise<Object>} Comments response
 */
export const getComments = async (videoId) => {
  try {
    const response = await api.get(API_ENDPOINTS.VIDEO.GET_COMMENTS(videoId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Comments fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch comments'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch comments',
        status: error.status || 500
      },
      message: 'Failed to fetch comments'
    };
  }
};

/**
 * Add a view to a video
 * @param {string} videoId - Video ID to add view to
 * @returns {Promise<Object>} View response
 */
export const addVideoView = async (videoId) => {
  try {
    const response = await api.get(API_ENDPOINTS.VIDEO.VIEW(videoId));

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'View added successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to add view'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to add view',
        status: error.status || 500
      },
      message: 'Failed to add view'
    };
  }
};

/**
 * Search videos
 * @param {Object} options - Search options
 * @param {string} options.query - Search query
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<Object>} Search response
 */
export const searchVideos = async (options = {}) => {
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

    const response = await api.get(API_ENDPOINTS.VIDEO.SEARCH, params);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Videos found successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to search videos'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to search videos',
        status: error.status || 500
      },
      message: 'Failed to search videos'
    };
  }
};

/**
 * Format video data for display
 * @param {Object} videoData - Raw video data from API
 * @returns {Object} Formatted video data
 */
export const formatVideoData = (videoData) => {
  return videoData; // Return data as-is from backend
};

/**
 * Format video list data
 * @param {Array} videos - Array of video objects
 * @returns {Array} Raw video list (no formatting)
 */
export const formatVideoList = (videos) => {
  return videos; // Return data as-is from backend
};

/**
 * Cache video data
 * @param {string} videoId - Video ID
 * @param {Object} videoData - Video data to cache
 * @returns {Promise<void>}
 */
export const cacheVideoData = async (videoId, videoData) => {
  try {
    const cacheKey = `video_${videoId}`;
    await setStorage(cacheKey, {
      data: videoData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn('Failed to cache video data:', error);
  }
};

/**
 * Get cached video data
 * @param {string} videoId - Video ID
 * @returns {Promise<Object|null>} Cached video data or null
 */
export const getCachedVideoData = async (videoId) => {
  try {
    const cacheKey = `video_${videoId}`;
    const cached = await getStorage(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes
      return cached.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get cached video data:', error);
    return null;
  }
};

/**
 * Validate video upload data
 * @param {Object} videoData - Video data to validate
 * @returns {Object} Validation result
 */
export const validateVideoUploadData = (videoData) => {
  const errors = {};

  // Validate video file
  if (!videoData.videoFile) {
    errors.videoFile = 'Video file is required';
  } else {
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
    if (!allowedVideoTypes.includes(videoData.videoFile.type)) {
      errors.videoFile = 'Please select a valid video file (MP4, MOV, AVI, or MKV)';
    }
    
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoData.videoFile.size && videoData.videoFile.size > maxSize) {
      errors.videoFile = 'Video file size must be less than 100MB';
    }
  }

  // Validate thumbnail file
  if (!videoData.thumbnailFile) {
    errors.thumbnailFile = 'Thumbnail file is required';
  } else {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(videoData.thumbnailFile.type)) {
      errors.thumbnailFile = 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (videoData.thumbnailFile.size && videoData.thumbnailFile.size > maxSize) {
      errors.thumbnailFile = 'Thumbnail file size must be less than 5MB';
    }
  }

  // Validate caption
  if (videoData.caption && videoData.caption.trim().length > 500) {
    errors.caption = 'Caption must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate comment data
 * @param {Object} commentData - Comment data to validate
 * @returns {Object} Validation result
 */
export const validateCommentData = (commentData) => {
  const errors = {};

  // Validate comment text
  if (!commentData.text || commentData.text.trim().length === 0) {
    errors.text = 'Comment text is required';
  } else if (commentData.text.trim().length > 1000) {
    errors.text = 'Comment must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get like count for a single video
 * @param {string} videoId
 * @returns {Promise<Object>} Like count response
 */
export const getLikesForVideo = async (videoId) => {
  try {
    const endpoint = `/videos/likes/${videoId}`;
    const response = await api.get(endpoint);
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Like count fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch like count'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch like count',
        status: error.status || 500
      },
      message: 'Failed to fetch like count'
    };
  }
};

/**
 * Get like counts for all videos
 * @returns {Promise<Object>} Like counts response
 */
export const getLikesForAllVideos = async () => {
  try {
    const endpoint = `/videos/likes`;
    const response = await api.get(endpoint);
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Like counts fetched successfully'
      };
    } else {
      return {
        success: false,
        error: response.error,
        message: response.error.message || 'Failed to fetch like counts'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to fetch like counts',
        status: error.status || 500
      },
      message: 'Failed to fetch like counts'
    };
  }
};

// Export all functions
export default {
  uploadVideo,
  getVideoRecommendations,
  getUserVideos,
  likeVideo,
  unlikeVideo,
  toggleVideoLike,
  addComment,
  getComments,
  addVideoView,
  searchVideos,
  formatVideoData,
  formatVideoList,
  cacheVideoData,
  getCachedVideoData,
  validateVideoUploadData,
  validateCommentData,
  getLikesForVideo,
  getLikesForAllVideos
}; 