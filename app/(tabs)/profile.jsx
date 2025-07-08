import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { wp, hp } from '../../utils/helpers';
import { formatFollowers, formatLikes, formatViews } from '../../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock profile fetcher response
const mockProfile = {
  user_id: 12345,
  is_owner: true,
  username: 'cool_creator',
  display_name: 'Cool Creator',
  profile_picture_url: 'https://picsum.photos/200/200',
  follower_count: 10456,
  following_count: 150,
  likes_count: 670000,
  is_following: false,
  videos: [
    {
      id: 'vid6789',
      thumbnail_url: 'https://picsum.photos/200/300',
      view_count: 12500,
    },
    {
      id: 'vid6790',
      thumbnail_url: 'https://picsum.photos/201/300',
      view_count: 8900,
    },
    {
      id: 'vid6791',
      thumbnail_url: 'https://picsum.photos/202/300',
      view_count: 5600,
    },
    {
      id: 'vid6792',
      thumbnail_url: 'https://picsum.photos/203/300',
      view_count: 3200,
    },
    {
      id: 'vid6793',
      thumbnail_url: 'https://picsum.photos/204/300',
      view_count: 7800,
    },
    {
      id: 'vid6794',
      thumbnail_url: 'https://picsum.photos/205/300',
      view_count: 4500,
    },
  ],
  profile_updated_at: '2025-07-04T17:00:00Z',
};

export default function Profile() {
  const navigation = useNavigation();

  // Calculate thumbnail size
  const numColumns = 3;
  const thumbnailSize = (wp(100) - spacing.sm * (numColumns + 1)) / numColumns;

  // For demo, use mock data
  const user = mockProfile;
  const videos = mockProfile.videos;

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    navigation.navigate('EditProfile');
  };

  const handleFollow = () => {
    // Implement follow/unfollow logic
    console.log('Follow/Unfollow user');
  };

  const handleStatPress = (type) => {
    // Navigate to followers/following/likes lists
    navigation.navigate('FollowersPage', { initialTab: type, userId: user.user_id });
  };

  const handleVideoPress = (video) => {
    const initialIndex = videos.findIndex((v) => v.id === video.id);
    navigation.navigate('VideoViewer', { 
      videos, 
      initialIndex, 
      user 
    });
  };

  const renderVideoItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.videoThumbnail, { width: thumbnailSize, height: thumbnailSize * 1.5 }]}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnailImage} resizeMode="cover" />
      <View style={styles.videoOverlay}>
        <View style={styles.playButton}>
          <Ionicons name="play" size={14} color={theme.text} />
        </View>
        <Text style={styles.videoViews}>{formatViews(item.view_count)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[globalStyles.container, styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Image source={{ uri: user.profile_picture_url }} style={styles.avatar} />
          <Text style={[typography.h2, { color: theme.text, marginTop: spacing.md }]}>@{user.username}</Text>
          {user.display_name && (
            <Text style={[typography.h3, { color: theme.subtext, marginTop: 2 }]}>{user.display_name}</Text>
          )}
        </View>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('following')}>
            <Text style={[typography.h3, { color: theme.text }]}>{user.following_count}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Following </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('followers')}>
            <Text style={[typography.h3, { color: theme.text }]}>{formatFollowers(user.follower_count)}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Followers </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('likes')}>
            <Text style={[typography.h3, { color: theme.text }]}>{formatLikes(user.likes_count)}</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>Likes </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          {user.is_owner ? (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={handleEditProfile}>
              <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: user.is_following ? theme.subtext : theme.primary }]} onPress={handleFollow}>
              <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>{user.is_following ? 'Unfollow' : 'Follow'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.videosSection}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h3, { color: theme.text }]}>Videos</Text>
            <Text style={[typography.caption, { color: theme.subtext }]}>{videos.length} videos</Text>
          </View>
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
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
  videoRow: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  videoThumbnail: {
    marginBottom: spacing.sm,
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
});