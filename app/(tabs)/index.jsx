import { View, StyleSheet, FlatList, Share, Alert, Text, RefreshControl } from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { colors, globalStyles } from '../../constants/globalStyles';
import { hp, wp } from '../../utils/helpers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import VideoListItem from '../../components/VideoListItem';
import { getVideoRecommendations, addVideoView, toggleVideoLike } from '../../utils/videoService';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const isFocused = useIsFocused();
  const lastVisibleIdRef = useRef(null);
  const flatListRef = useRef(null);

  // Fetch video recommendations (reusable for initial load, pull-to-refresh, and tab re-tap)
  const loadRecommendations = useCallback(async (useFullScreenLoading = false) => {
    try {
      if (useFullScreenLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      console.log('🎬 Fetching video recommendations...');
      const response = await getVideoRecommendations({ limit: 20 });
      console.log('📡 Recommendations response:', response);
      if (response.success) {
        const formattedVideos = response.data.recommended.map(rec => {
          const id = rec.videoId || rec.id || rec._id || String(Math.random());
          const rawUri = rec.videoUrl || rec.url || rec.uri || '/uploads/default-video.mp4';
          const uri = (/^https?:\/\//i.test(rawUri))
            ? rawUri
            : `http://192.168.1.6:3000${rawUri.startsWith('/') ? rawUri : `/${rawUri}`}`;
          const userObj = (rec.userId && typeof rec.userId === 'object') ? rec.userId : (rec.user || null);
          const username = rec.userName || rec.username || rec.author || (userObj && (userObj.userName || userObj.username)) || 'Unknown';
          const profileImage = rec.authorImageUrl || rec.profileImageUrl || rec.imageUrl || (userObj && userObj.imageUrl) || null;
          const authorId = rec.authorId || (userObj && (userObj._id || userObj.id)) || (typeof rec.userId === 'string' ? rec.userId : rec.ownerId);
          return {
            id,
            uri,
            caption: rec.caption || 'No caption',
            username,
            profileImage,
            authorId,
            isFollowing: typeof rec.isFollowing === 'boolean' ? rec.isFollowing : undefined,
            likes: rec.likes ?? rec.likeCount ?? 0,
            comments: rec.comments ?? rec.commentCount ?? 0,
            shares: rec.shares ?? 0,
            isLiked: rec.isLiked ?? false,
            rank: rec.rank,
            score: rec.score,
            method: rec.method,
          };
        });
        console.log('✅ Formatted videos:', formattedVideos);
        setVideos(formattedVideos);
        if (formattedVideos.length > 0) {
          setCurrentVideoId(formattedVideos[0].id);
        }
      } else {
        console.log('❌ Failed to fetch recommendations:', response.error);
        setError(response.error.message);
      }
    } catch (err) {
      console.error('💥 Error fetching recommendations:', err);
      setError('Failed to load videos');
    } finally {
      if (useFullScreenLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadRecommendations(true);
  }, [loadRecommendations]);

  // Re-tap Home tab to refresh and scroll to top
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      try {
        // Scroll to first video, then trigger a refresh
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
        loadRecommendations(false);
      } catch (e) {
        // no-op
      }
    });
    return unsubscribe;
  }, [navigation, loadRecommendations]);

  const handleLike = async (videoId) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      const response = await toggleVideoLike(videoId, video.isLiked);
      
      if (response.success) {
        setVideos(currentVideos =>
          currentVideos.map(v => {
            if (v.id === videoId) {
              return {
                ...v,
                isLiked: !v.isLiked,
                likes: v.isLiked ? v.likes - 1 : v.likes + 1,
              };
            }
            return v;
          })
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

  const handleShare = async (videoUri) => {
    try {
      await Share.share({
        message: 'Check out this awesome TikTok video!',
        url: videoUri,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleProfilePress = (videoItem) => {
    if (videoItem.authorId) {
      navigation.navigate('UserProfile', { userId: String(videoItem.authorId) });
      return;
    }
    if (videoItem.username) {
      navigation.navigate('UserProfile', { userName: videoItem.username });
    }
  };

  const handleFollowPress = async (videoItem) => {
    try {
      if (!videoItem.authorId) return;
      // optimistic toggle follow on list
      setVideos(prev => prev.map(v => v.id === videoItem.id ? { ...v, isFollowing: !v.isFollowing } : v));
      const { toggleFollowStatus } = await import('../../utils/userService');
      await toggleFollowStatus(String(videoItem.authorId), !!videoItem.isFollowing);
    } catch (e) {
      // revert on error
      setVideos(prev => prev.map(v => v.id === videoItem.id ? { ...v, isFollowing: videoItem.isFollowing } : v));
      console.warn('Failed to toggle follow from Home:', e?.message || e);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useCallback(async ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0].item;
      const visibleId = visibleItem.id;
      setCurrentVideoId(visibleId);
      lastVisibleIdRef.current = visibleId;
      
      // Add view when video becomes visible and hydrate visible item with full details
      try {
        const res = await addVideoView(visibleId);
        if (res && res.success && res.data && res.data.video) {
          const v = res.data.video;
          setVideos(prev => prev.map(item => {
            if (item.id !== visibleId) return item;
            return {
              ...item,
              uri: v.videoUrl || item.uri,
              username: (v.userId && (v.userId.userName || v.userId.username)) || item.username,
              profileImage: (v.userId && v.userId.imageUrl) || item.profileImage,
              likes: (typeof v.likeCount === 'number') ? v.likeCount : item.likes,
              comments: (typeof v.commentCount === 'number') ? v.commentCount : item.comments,
            };
          }));
        }
      } catch (err) {
        console.warn('Failed to add view or hydrate video:', err);
      }
    }
  }, []);

  // Pause videos when screen loses focus; restore on refocus
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadRecommendations(false)}
                tintColor={colors.white}
                colors={[colors.primary]}
              />
            }
            renderItem={({ item, index }) => (
              <VideoListItem
                item={item}
                currentVideoId={currentVideoId}

                handleDoubleTap={handleDoubleTap}
                handleLike={handleLike}
                onOpenComments={() => navigation.navigate('VideoViewer', { videos, initialIndex: index, openComments: true })}
                handleShare={handleShare}
                handleProfilePress={handleProfilePress}
                handleFollowPress={handleFollowPress}
                isCommentModalVisible={isCommentModalVisible}
              />
            )}
          />
        </View>
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
});

