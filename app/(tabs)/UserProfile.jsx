import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { wp, hp } from '../../utils/helpers';

import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, toggleFollowStatus } from '../../utils/userService';
import { getUserVideos } from '../../utils/videoService';
import { defaultAvatar } from '../../constants/images';

export default function UserProfile({ route }) {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get navigation parameters from both React Navigation and expo-router
  const rnParams = route?.params || {};
  const expoParams = useLocalSearchParams ? useLocalSearchParams() : {};
  const userIdParam = rnParams.userId || expoParams.userId || rnParams._id || expoParams._id || rnParams.id || expoParams.id;
  const userNameParam = rnParams.userName || expoParams.userName;
  console.log('🔍 UserProfile page received params:', { rnParams, expoParams, userIdParam, userNameParam });

  // Calculate thumbnail size
  const numColumns = 3;
  const thumbnailSize = (wp(100) - spacing.sm * (numColumns + 1)) / numColumns;

  // Fetch user profile and videos
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile...');

        const { getAccessToken } = await import('../../utils/tokenStore');
        const token = getAccessToken();
        console.log('In-memory token exists:', !!token);

        const profileOptions = userIdParam ? { userId: String(userIdParam) } : {};
        const response = await getUserProfile(profileOptions);
        console.log('Profile response:', response);

        if (response.success) {
          console.log('User data:', response.data);
          setUser(response.data);

          // Fetch user videos
          console.log('Fetching user videos...');
          const videosOptions = userIdParam ? { userId: String(userIdParam) } : {};
          const videosResponse = await getUserVideos(videosOptions);
          console.log('Videos response:', videosResponse);

          if (videosResponse.success) {
            console.log('Videos data:', videosResponse.data.videos || []);
            setVideos((videosResponse.data.videos || []));
          } else {
            console.log('Videos fetch failed:', videosResponse.error);
            setVideos([]);
          }
        } else {
          console.log('Profile fetch failed:', response.error);
          setError(response.error.message);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userIdParam]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      const response = await toggleFollowStatus(user._id, user.isFollowing);

      if (response.success) {
        setUser(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          follower_count: prev.isFollowing ? prev.follower_count - 1 : prev.follower_count + 1
        }));
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleStatPress = (type) => {
    navigation.navigate('FollowersPage', { initialTab: type, userId: user._id });
  };

  const handleVideoPress = (video) => {
    const initialIndex = videos.findIndex((v) => v._id === video._id);
    navigation.navigate('VideoViewer', {
      videos,
      initialIndex,
      user
    });
  };

  const renderVideoItem = ({ item, index }) => (
    <TouchableOpacity
      key={item._id || `video-${index}`}
      style={[styles.videoThumbnail, { width: thumbnailSize, height: thumbnailSize * 1.5 }]}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} resizeMode="cover" />
      <View style={styles.videoOverlay}>
        <View style={styles.playButton}>
          <Ionicons name="play" size={14} color={theme.text} />
        </View>
        <Text style={styles.videoViews}>{item.views || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.body, { color: theme.subtext }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.errorContainer}>
          <Text style={[typography.body, { color: theme.subtext }]}>{error || 'Failed to load profile'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : defaultAvatar}
            defaultSource={defaultAvatar}
            style={styles.avatar}
          />
          <Text style={[typography.h2, { color: theme.text, marginTop: spacing.md }]}>@{user.userName}</Text>
          {user.displayName && (
            <Text style={[typography.h3, { color: theme.subtext, marginTop: 2 }]}>{user.displayName}</Text>
          )}
        </View>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('following')}>
            <Text style={[typography.h3, { color: theme.text }]}>{user.following || 0}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Following </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('followers')}>
            <Text style={[typography.h3, { color: theme.text }]}>{user.followers || 0}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Followers </Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={[typography.h3, { color: theme.text }]}>{0}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Likes </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: user.isFollowing ? theme.subtext : theme.primary }]} onPress={handleFollow}>
            <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{user.isFollowing ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.videosSection}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: theme.text }]}>Videos</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>{videos.length} videos</Text>
          </View>
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={item => item._id}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  videosSection: {
    paddingHorizontal: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  videosGrid: {
    alignItems: 'flex-start',
  },

  videoThumbnail: {
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.card,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoViews: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
}); 