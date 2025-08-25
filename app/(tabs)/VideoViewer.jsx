import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVideoPlayer } from 'expo-video';
import VideoListItem from '../../components/VideoListItem';
import { wp, hp } from '../../utils/helpers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../../constants/globalStyles';
import { globalStyles } from '../../constants/globalStyles';
import { getVideoRecommendations, addVideoView, toggleVideoLike, getComments as fetchCommentsApi, addComment as addCommentApi } from '../../utils/videoService';
import { useIsFocused } from '@react-navigation/native';
import CommentModal from '../../components/CommentModal';
import { AuthContext } from '../../store/auth-context';

export default function VideoViewer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { videos: initialVideos, initialIndex = 0, user } = route.params || {};
  const flatListRef = useRef(null);
  const [videos, setVideos] = useState(initialVideos || []);
  const [loading, setLoading] = useState(!initialVideos);
  const [error, setError] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(
    initialVideos && initialVideos[initialIndex] ? initialVideos[initialIndex].id : null
  );
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [activeCommentsVideoId, setActiveCommentsVideoId] = useState(null);
  const [commentsByVideo, setCommentsByVideo] = useState({});
  const [sendingComment, setSendingComment] = useState(false);
  const isFocused = useIsFocused();
  const lastVisibleIdRef = useRef(null);
  const { user: authUser } = useContext(AuthContext);

  const normalizeVideos = (inputVideos, fallbackUser, forceUserOverride = false) => {
    if (!Array.isArray(inputVideos)) return [];
    const firstNonEmpty = (...vals) => {
      for (const v of vals) {
        if (typeof v === 'string' && v.trim().length > 0) return v.trim();
        if (v && typeof v === 'string') return v; // safety
      }
      return null;
    };
    return inputVideos.map((v) => {
      const id = v.id || v._id || v.videoId || String(Math.random());
      const uri = v.uri || v.videoUrl || v.url;
      const username = forceUserOverride && (fallbackUser?.userName || fallbackUser?.username)
        ? (fallbackUser.userName || fallbackUser.username)
        : (firstNonEmpty(
            v.username,
            v.userId && typeof v.userId === 'object' && v.userId.userName,
            fallbackUser?.userName,
            fallbackUser?.username,
          ) || 'Unknown');

      const profileImage = forceUserOverride && fallbackUser?.imageUrl
        ? fallbackUser.imageUrl
        : firstNonEmpty(
            v.profileImage,
            v.userId && typeof v.userId === 'object' && v.userId.imageUrl,
            fallbackUser?.imageUrl,
          );
      return {
        id,
        uri,
        caption: v.caption || '',
        username,
        profileImage,
        likes: v.likes ?? v.likeCount ?? 0,
        comments: v.comments ?? v.commentCount ?? 0,
        shares: v.shares ?? 0,
        isLiked: v.isLiked ?? false,
        rank: v.rank,
        score: v.score,
        method: v.method,
      };
    });
  };

  // Normalize incoming videos from profile/user pages
  useEffect(() => {
    if (initialVideos && Array.isArray(initialVideos) && initialVideos.length > 0) {
      const normalized = normalizeVideos(initialVideos, user, !!user);
      setVideos(normalized);
      setCurrentVideoId(normalized[initialIndex]?.id ?? normalized[0]?.id ?? null);
      setLoading(false);
      if (route.params?.openComments) {
        const targetId = normalized[initialIndex]?.id ?? normalized[0]?.id;
        if (targetId) {
          openComments(targetId);
        }
      }
    }
  }, [initialVideos, user, initialIndex]);

  // Fetch videos if not provided
  useEffect(() => {
    if (!initialVideos) {
      setLoading(true);
      getVideoRecommendations({ limit: 20 })
        .then((response) => {
          if (response.success) {
            setVideos(response.data.recommended.map(rec => ({
              id: rec.videoId,
              uri: rec.videoUrl || '/uploads/default-video.mp4',
              caption: rec.caption || 'No caption',
              username: rec.author || 'Unknown',
              profileImage: rec.authorImageUrl || null,
              likes: 0,
              comments: 0,
              shares: 0,
              isLiked: false,
              rank: rec.rank,
              score: rec.score,
              method: rec.method
            })));
            if (response.data.recommended.length > 0) {
              setCurrentVideoId(response.data.recommended[0].videoId);
            }
          } else {
            setError(response.error.message);
          }
        })
        .catch((err) => {
          setError('Failed to load videos');
        })
        .finally(() => setLoading(false));
    }
  }, [initialVideos]);

  // Handlers (consistent with index.jsx)
  const handleLike = async (videoId) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;
      const response = await toggleVideoLike(videoId, video.isLiked);
      if (response.success) {
        setVideos(currentVideos =>
          currentVideos.map(v =>
            v.id === videoId
              ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
              : v
          )
        );
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleDoubleTap = (videoId) => {
    handleLike(videoId);
  };
  const openComments = async (videoId) => {
    try {
      setActiveCommentsVideoId(videoId);
      setIsCommentModalVisible(true);
      if (!commentsByVideo[videoId]) {
        const res = await fetchCommentsApi(videoId);
        if (res.success) {
          setCommentsByVideo(prev => ({ ...prev, [videoId]: res.data.comments || [] }));
        } else {
          Alert.alert('Error', res.error?.message || 'Failed to fetch comments');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open comments');
    }
  };

  const sendComment = async (text) => {
    if (!activeCommentsVideoId) return false;
    try {
      setSendingComment(true);
      const res = await addCommentApi(activeCommentsVideoId, text);
      if (res.success) {
        const newComment = res.data.comment;
        setCommentsByVideo(prev => ({
          ...prev,
          [activeCommentsVideoId]: [newComment, ...(prev[activeCommentsVideoId] || [])]
        }));
        setVideos(curr => curr.map(v => v.id === activeCommentsVideoId ? { ...v, comments: (v.comments || 0) + 1 } : v));
        return true;
      } else {
        Alert.alert('Error', res.error?.message || 'Failed to add comment');
        return false;
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add comment');
      return false;
    } finally {
      setSendingComment(false);
    }
  };


  const handleShare = async (videoUri) => {
    try {
      await Share.share({
        message: 'Check out this awesome TikTok video!',
        url: videoUri,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share video');
    }
  };

  const handleProfilePress = (videoItem) => {
    // If the normalized item preserved original mapping, try to obtain user id/name
    // Our normalized items contain username and profileImage only; we need userId
    // For items coming from profile pages, "user" param is available
    const possibleUserId = videoItem.userId || videoItem.ownerId || videoItem.authorId || null;
    if (possibleUserId) {
      navigation.navigate('UserProfile', { userId: possibleUserId });
      return;
    }
    if (user && user.id) {
      navigation.navigate('UserProfile', { userId: user.id });
      return;
    }
    // As a fallback, navigate by username if backend supports it via query (our getUserProfile accepts userName)
    if (videoItem.username) {
      navigation.navigate('UserProfile', { userName: videoItem.username });
      return;
    }
  };

  const handleFollowPress = async (videoItem) => {
    try {
      if (!videoItem.authorId) return;
      
      // Optimistic update
      setVideos(prev => prev.map(v => 
        v.id === videoItem.id ? { ...v, isFollowing: !v.isFollowing } : v
      ));
      
      // Perform the actual API call
      const { toggleFollowStatus } = await import('../../utils/userService');
      await toggleFollowStatus(String(videoItem.authorId), !!videoItem.isFollowing);
    } catch (e) {
      // Revert on error
      setVideos(prev => prev.map(v => 
        v.id === videoItem.id ? { ...v, isFollowing: videoItem.isFollowing } : v
      ));
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useRef(async ({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const visibleId = viewableItems[0].item.id;
      setCurrentVideoId(visibleId);
      lastVisibleIdRef.current = visibleId;
      try {
        await addVideoView(visibleId);
      } catch (err) {
        // Silently fail view tracking
      }
    }
  }).current;

  // Pause videos when screen loses focus; restore when refocused
  useEffect(() => {
    if (!isFocused) {
      setCurrentVideoId(null);
    } else {
      if (lastVisibleIdRef.current) {
        setCurrentVideoId(lastVisibleIdRef.current);
      }
    }
  }, [isFocused]);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[globalStyles.container, styles.container]}>
          <View style={styles.videoContainer}>
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.white }]}>Loading videos...</Text>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[globalStyles.container, styles.container]}>
          <View style={styles.videoContainer}>
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.white }]}>{error}</Text>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[globalStyles.container, styles.container]}>
          <View style={styles.videoContainer}>
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.white }]}>No videos found</Text>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.videoContainer}>
          <FlatList
            ref={flatListRef}
            data={videos}
            pagingEnabled
            snapToAlignment="center"
            snapToInterval={hp(100)}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            keyExtractor={(item) => item.id}
            initialScrollIndex={initialIndex}
            renderItem={({ item }) => (
              <VideoListItem
                item={item}
                currentVideoId={currentVideoId}

                handleDoubleTap={handleDoubleTap}
                handleLike={handleLike}
                onOpenComments={openComments}
                handleShare={handleShare}
                handleProfilePress={handleProfilePress}
                handleFollowPress={handleFollowPress}
                isCommentModalVisible={isCommentModalVisible}
              />
            )}
            getItemLayout={(data, index) => ({
              length: hp(100),
              offset: hp(100) * index,
              index,
            })}
          />
        </View>
        <CommentModal
          visible={isCommentModalVisible}
          onClose={() => setIsCommentModalVisible(false)}
          comments={commentsByVideo[activeCommentsVideoId] || []}
          onSend={sendComment}
          sending={sendingComment}
          currentUserImage={authUser?.imageUrl}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  videoContainer: {
    width: wp(100),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoItem: {
    width: wp(100),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});