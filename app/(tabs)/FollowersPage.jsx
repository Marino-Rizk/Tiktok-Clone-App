import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { theme, typography, spacing } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const TABS = [
  { key: 'following', label: 'Following' },
  { key: 'followers', label: 'Followers' },
  { key: 'likes', label: 'Likes' },
];

export default function FollowersPage({ route }) {
  const initialTab = route?.params?.initialTab || 'followers';
  const [activeTab, setActiveTab] = useState(initialTab);

  // For demo, use the same mock data for all tabs
  const getData = () => mockUsers;

  const handleFollowToggle = (userId) => {
    // Implement follow/unfollow logic here
    // For demo, just log
    console.log('Toggle follow for', userId);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
      <Text style={[typography.body, { color: theme.text, flex: 1, marginLeft: 12 }]}>{item.username}</Text>
      {(activeTab === 'followers' || activeTab === 'following') && (
        <TouchableOpacity
          style={[styles.followBtn, { backgroundColor: item.is_following ? theme.subtext : theme.primary }]}
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text style={{ color: theme.text, fontWeight: '600' }}>{item.is_following ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
      {/* Tab Bar */}
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
      {/* List */}
      <FlatList
        data={getData()}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: theme.subtext, textAlign: 'center', marginTop: 32 }}>No users found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: 'transparent',
    paddingTop: spacing.lg,
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 