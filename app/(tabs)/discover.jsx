import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import SearchBar from '../../components/ui/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
 
import { useNavigation } from '@react-navigation/native';
import { searchUsers, toggleFollowStatus } from '../../utils/userService';
import { searchVideos } from '../../utils/videoService';
import { buildAbsoluteUrl } from '../../utils/api';
import { defaultAvatar } from '../../constants/images';
import { AuthContext } from '../../store/auth-context';



const TABS = [
  { key: 'videos', label: 'Videos' },
  { key: 'users', label: 'Users' },
];

const BUTTON_WIDTH = 100;

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('videos');
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [videoSearchResults, setVideoSearchResults] = useState([]);
  const [videoSearchLoading, setVideoSearchLoading] = useState(false);
  const [videoSearchError, setVideoSearchError] = useState(null);
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id || currentUser?.id || null;

  const handleSearch = (text) => setSearchQuery(text);

  // Responsive 2-column grid
  const numColumns = 2;
  const gutter = spacing.sm;
  const screenWidth = Dimensions.get('window').width;
  const thumbnailSize = (screenWidth - spacing.lg * 2 - gutter * (numColumns - 1)) / numColumns;

  // Search users and videos when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSearchError(null);
        setVideoSearchResults([]);
        setVideoSearchError(null);
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError(null);
        setVideoSearchLoading(true);
        setVideoSearchError(null);
        
        // Search users
        const userResponse = await searchUsers({ query: searchQuery });
        if (userResponse.success) {
          setSearchResults(userResponse.data.users || []);
        } else {
          setSearchError(userResponse.error.message);
          setSearchResults([]);
        }

        // Search videos
        const videoResponse = await searchVideos({ query: searchQuery });
        if (videoResponse.success) {
          const vids = Array.isArray(videoResponse.data.videos) ? videoResponse.data.videos : [];
          const filtered = currentUserId
            ? vids.filter(v => {
                const owner = v.userId;
                if (!owner) return true;
                // owner can be string or populated object with _id
                const ownerId = typeof owner === 'string' ? owner : (owner._id || owner.id);
                return ownerId !== currentUserId;
              })
            : vids;
          setVideoSearchResults(filtered);
        } else {
          setVideoSearchError(videoResponse.error.message);
          setVideoSearchResults([]);
        }
      } catch (err) {
        setSearchError('Failed to search users');
        setVideoSearchError('Failed to search videos');
        setSearchResults([]);
        setVideoSearchResults([]);
      } finally {
        setSearchLoading(false);
        setVideoSearchLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFollowToggle = async (userId) => {
    try {
      const user = searchResults.find(u => u._id === userId);
      if (!user) {
        return;
      }

      // Validate userId is not undefined or null
      if (!userId) {
        Alert.alert('Error', 'Invalid user ID');
        return;
      }
      const response = await toggleFollowStatus(userId, user.isFollowing);
      
      if (response.success) {
        setSearchResults(prev => prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: !u.isFollowing }
            : u
        ));
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update follow status');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  // Handle user item press - navigate to user profile
  const handleUserPress = (user) => {
    if (!user._id) {
      Alert.alert('Error', 'Cannot open profile - user ID is missing');
      return;
    }
    
    navigation.navigate('UserProfile', { 
      userId: user._id,
      userName: user.userName 
    });
  };

  const renderUserItem = ({ item }) => {
    // Validate item has required fields - use actual backend field names
    if (!item || !item._id) {
      return null;
    }

    // Resolve avatar URL with fallback
    const avatarUrl = buildAbsoluteUrl(item.imageUrl || item.profilePicture || item.profile_picture_url);

    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.blurhash && (
            <View style={[styles.avatar, styles.blurhashPlaceholder]} />
          )}
          <Image 
            source={avatarUrl ? { uri: avatarUrl } : defaultAvatar} 
            defaultSource={defaultAvatar}
            style={styles.avatar} 
            resizeMode="cover"
          />
        </View>
        <Text style={[typography.body, { color: theme.text, flex: 1, marginLeft: 12 }]}>{item.userName}</Text>
        <TouchableOpacity
          style={[
            styles.followBtn,
            { backgroundColor: item.isFollowing ? theme.subtext : theme.primary, width: BUTTON_WIDTH }
          ]}
          onPress={() => handleFollowToggle(item._id)}
        >
          <Text style={{ color: theme.text, fontWeight: '600', textAlign: 'center' }}>
            {item.isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderVideoItem = ({ item, index }) => (
    <TouchableOpacity
      key={item._id || `video-${index}`}
      style={[styles.videoThumbnail, { width: thumbnailSize, height: thumbnailSize * 1.5, margin: gutter / 2 }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('VideoViewer', {
        videos: filteredVideos,
        initialIndex: index
      })}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} resizeMode="cover" />
      <View style={styles.videoOverlay}>
        <Text style={styles.videoViews}>{item.views || 0} views</Text>
      </View>
    </TouchableOpacity>
  );

  

  // Filtered data for search
  const filteredVideos = videoSearchResults;
  const filteredUsers = searchQuery ? searchResults : [];

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.searchContainer}>
        <Text style={[typography.h2, { color: theme.text }]}>Discover</Text>
      </View>
      <SearchBar
        placeholder="Search videos or users"
        onSearch={handleSearch}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? theme.primary : theme.subtext }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'videos' && (
          searchQuery ? (
            <FlatList
              data={filteredVideos}
              renderItem={renderVideoItem}
              keyExtractor={item => item._id}
              numColumns={numColumns}
              contentContainerStyle={{ padding: 0 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  {videoSearchLoading ? (
                    <Text style={{ color: theme.subtext, textAlign: 'center' }}>Searching videos...</Text>
                  ) : videoSearchError ? (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{videoSearchError}</Text>
                  ) : (
                    <Text style={{ color: theme.subtext, textAlign: 'center' }}>No videos found.</Text>
                  )}
                </View>
              }
              style={{ flex: 1 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ color: theme.subtext, textAlign: 'center' }}>Search for videos to get started.</Text>
            </View>
          )
        )}
        {activeTab === 'users' && (
          <FlatList
            data={filteredUsers.filter(item => item && item._id)}
            renderItem={renderUserItem}
            keyExtractor={item => item._id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                {searchLoading ? (
                  <Text style={{ color: theme.subtext, textAlign: 'center' }}>Searching...</Text>
                ) : searchError ? (
                  <Text style={{ color: 'red', textAlign: 'center' }}>{searchError}</Text>
                ) : searchQuery ? (
                  <Text style={{ color: theme.subtext, textAlign: 'center' }}>No users found.</Text>
                ) : (
                  <Text style={{ color: theme.subtext, textAlign: 'center' }}>Search for users to get started.</Text>
                )}
              </View>
            }
            style={{ flex: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.xl,
  },
  searchResultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: theme.inputBg,
    borderColor: theme.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  searchInput: {
    color: theme.text,
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: 'transparent',
    marginBottom: spacing.lg,
  },
  tabBtn: {
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  videoThumbnail: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.card,
    marginBottom: spacing.md,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  videoViews: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  blurhashPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.card,
  },
  followBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
}); 