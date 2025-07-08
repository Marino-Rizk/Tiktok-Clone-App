import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import SearchBar from '../../components/ui/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp } from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';

const mockUsers = [
  {
    id: '1',
    username: 'user_one',
    profile_picture_url: 'https://picsum.photos/50/50?1',
    is_following: true,
  },
  {
    id: '2',
    username: 'user_two',
    profile_picture_url: 'https://picsum.photos/50/50?2',
    is_following: false,
  },
  {
    id: '3',
    username: 'user_three',
    profile_picture_url: 'https://picsum.photos/50/50?3',
    is_following: true,
  },
];

const mockVideos = [
  { id: 'v1', thumbnail_url: 'https://picsum.photos/200/300', view_count: 1200 },
  { id: 'v2', thumbnail_url: 'https://picsum.photos/201/300', view_count: 980 },
  { id: 'v3', thumbnail_url: 'https://picsum.photos/202/300', view_count: 560 },
  { id: 'v4', thumbnail_url: 'https://picsum.photos/203/300', view_count: 320 },
  { id: 'v5', thumbnail_url: 'https://picsum.photos/204/300', view_count: 780 },
  { id: 'v6', thumbnail_url: 'https://picsum.photos/205/300', view_count: 450 },
  { id: 'v7', thumbnail_url: 'https://picsum.photos/206/300', view_count: 210 },
  { id: 'v8', thumbnail_url: 'https://picsum.photos/207/300', view_count: 150 },
];

const TABS = [
  { key: 'videos', label: 'Videos' },
  { key: 'users', label: 'Users' },
];

const PAGE_SIZE = 6;

const BUTTON_WIDTH = 100;

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [videoPage, setVideoPage] = useState(1);
  const [videoData, setVideoData] = useState(mockVideos.slice(0, PAGE_SIZE));
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation();

  const handleSearch = (text) => setSearchQuery(text);
  const handleSearchFocus = () => setIsSearching(true);
  const handleSearchBlur = () => setIsSearching(false);

  // Responsive 2-column grid
  const numColumns = 2;
  const gutter = spacing.sm;
  const screenWidth = Dimensions.get('window').width;
  const thumbnailSize = (screenWidth - spacing.lg * 2 - gutter * (numColumns - 1)) / numColumns;

  // Mock follow toggle
  const handleFollowToggle = (userId) => {
    // In a real app, call API here
    setUserState(prev => prev.map(u =>
      u.id === userId ? { ...u, is_following: !u.is_following } : u
    ));
  };

  // For mock, keep user state local
  const [userState, setUserState] = useState(mockUsers);

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
      <Text style={[typography.body, { color: theme.text, flex: 1, marginLeft: 12 }]}>{item.username}</Text>
      <TouchableOpacity
        style={[
          styles.followBtn,
          { backgroundColor: item.is_following ? theme.subtext : theme.primary, width: BUTTON_WIDTH }
        ]}
        onPress={() => handleFollowToggle(item.id)}
      >
        <Text style={{ color: theme.text, fontWeight: '600', textAlign: 'center' }}>
          {item.is_following ? 'Unfollow' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVideoItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.videoThumbnail, { width: thumbnailSize, height: thumbnailSize * 1.5, margin: gutter / 2 }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('VideoViewer', {
        videos: filteredVideos,
        initialIndex: index
      })}
    >
      <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnailImage} resizeMode="cover" />
      <View style={styles.videoOverlay}>
        <Text style={styles.videoViews}>{item.view_count} views</Text>
      </View>
    </TouchableOpacity>
  );

  const handleLoadMoreVideos = () => {
    if (loadingMore) return;
    if (videoData.length >= mockVideos.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = videoPage + 1;
      const newData = mockVideos.slice(0, nextPage * PAGE_SIZE);
      setVideoData(newData);
      setVideoPage(nextPage);
      setLoadingMore(false);
    }, 500);
  };

  // Filtered data for search
  const filteredVideos = searchQuery
    ? mockVideos.filter(v => v.id.includes(searchQuery) || String(v.view_count).includes(searchQuery))
    : videoData;
  const filteredUsers = searchQuery
    ? mockUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockUsers;

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.searchContainer}>
        <Text style={[typography.h2, { color: theme.text }]}>Discover</Text>
      </View>
      <SearchBar
        placeholder="Search videos or users"
        onSearch={handleSearch}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
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
          <FlatList
            data={filteredVideos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            contentContainerStyle={{ padding: 0 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            onEndReached={handleLoadMoreVideos}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <Text style={{ color: theme.subtext, textAlign: 'center', margin: 16 }}>Loading...</Text> : null}
            ListEmptyComponent={<Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 32 }}>No videos found.</Text>}
            style={{ flex: 1 }}
          />
        )}
        {activeTab === 'users' && (
          <FlatList
            data={filteredUsers.map(u => userState.find(us => us.id === u.id) || u)}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 32 }}>No users found.</Text>}
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.card,
  },
  followBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 