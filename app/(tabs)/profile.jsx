import { View, Text, StyleSheet, ScrollView, Image, useColorScheme, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import React, { useMemo } from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock user data
const mockUser = {
  id: 'u1',
  username: 'ugolord',
  displayName: 'Ugo Lord',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  bio: `Hi! I'm Ugo Lord!\nBiz Lawyer, Biz Coach, & Public Spkr\nMgmt: Ugo@ZodiacEnt.com`,
  following: 178,
  followers: 6700000,
  likes: 258200000,
  isMe: true, // set to false to simulate another user's profile
};

// Mock videos data
const mockVideos = [
  {
    id: 'v1',
    thumbnail: 'https://placehold.co/300x300',
    views: 80700000,
  },
  {
    id: 'v2',
    thumbnail: 'https://placehold.co/300x300',
    views: 78500000,
  },
  {
    id: 'v3',
    thumbnail: 'https://placehold.co/300x300',
    views: 1200000,
  },
  // Add more mock videos as needed
];

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const gridSpacing = spacing.sm;
const thumbnailSize = useMemo(() => (screenWidth - gridSpacing * (numColumns + 1)) / numColumns, [screenWidth]);

export default function Profile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? colors.black : colors.white;
  const textColor = isDark ? colors.white : colors.black;
  const secondaryText = isDark ? colors.gray[300] : colors.gray[400];
  const navigation = useNavigation();

  // For demo, use mock data
  const user = mockUser;
  const videos = mockVideos; // set to [] to test empty state

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    navigation.navigate('EditProfile');
  };

  const handleFollow = () => {
    // Implement follow/unfollow logic
    // ...
  };

  const handleStatPress = (type) => {
    // Optionally navigate to followers/following/likes lists
    // navigation.navigate(type === 'followers' ? 'FollowersList' : 'FollowingList', { userId: user.id });
  };

  const handleVideoPress = (video) => {
    navigation.navigate('Video', { videoId: video.id });
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={{
        width: thumbnailSize,
        height: thumbnailSize,
        margin: gridSpacing / 2,
        backgroundColor: colors.gray[300],
        borderRadius: 8,
        overflow: 'hidden',
      }}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: '100%' }} />
      <View style={styles.videoOverlay}>
        <Ionicons name="play" size={18} color={colors.white} style={{ marginRight: 4 }} />
        <Text style={styles.videoViews}>{formatViews(item.views)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[globalStyles.container, styles.container, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={[typography.h2, { color: textColor, marginTop: spacing.md }]}>@{user.username}</Text>
          {user.displayName ? (
            <Text style={[typography.h3, { color: secondaryText, marginTop: 2 }]}>{user.displayName}</Text>
          ) : null}
          <Text style={[typography.body, { color: secondaryText, marginTop: spacing.sm, textAlign: 'center' }]}>{user.bio}</Text>
        </View>
        {/* Stats Section */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('following')}>
            <Text style={[typography.h3, { color: textColor }]}>{user.following}</Text>
            <Text style={[typography.caption, { color: secondaryText }]}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('followers')}>
            <Text style={[typography.h3, { color: textColor }]}>{formatFollowers(user.followers)}</Text>
            <Text style={[typography.caption, { color: secondaryText }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('likes')}>
            <Text style={[typography.h3, { color: textColor }]}>{formatLikes(user.likes)}</Text>
            <Text style={[typography.caption, { color: secondaryText }]}>Likes</Text>
          </TouchableOpacity>
        </View>
        {/* Action Button */}
        <View style={styles.actionRow}>
          {user.isMe ? (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.gray[300] }]} onPress={handleEditProfile}>
              <Text style={[typography.body, { color: textColor, fontWeight: '600' }]}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleFollow}>
              <Text style={[typography.body, { color: colors.white, fontWeight: '600' }]}>Follow</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Content Grid or Empty State */}
        <View style={{ marginTop: spacing.xl }}>
          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="camera" size={64} color={secondaryText} style={{ marginBottom: 16 }} />
              <Text style={[typography.body, { color: secondaryText, textAlign: 'center' }]}>Upload your first video!</Text>
            </View>
          ) : (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: gridSpacing / 2 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatFollowers(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num;
}
function formatLikes(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num;
}
function formatViews(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num;
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
    borderColor: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  videoOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  videoViews: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
}); 