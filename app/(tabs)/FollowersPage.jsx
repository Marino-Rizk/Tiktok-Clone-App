import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, useColorScheme, Dimensions } from 'react-native';
import { colors, typography, spacing } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../utils/helpers';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? colors.black : colors.white;
  const textColor = isDark ? colors.white : colors.black;
  const secondaryText = isDark ? colors.gray[300] : colors.gray[400];

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
      <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: 12 }]}>{item.username}</Text>
      {(activeTab === 'followers' || activeTab === 'following') && (
        <TouchableOpacity
          style={[styles.followBtn, { backgroundColor: item.is_following ? colors.gray[400] : colors.primary }]}
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text style={{ color: item.is_following ? textColor : colors.white, fontWeight: '600' }}>
            {item.is_following ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? colors.primary : secondaryText }]}> 
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* List */}
      <FlatList
        data={getData()}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: secondaryText, textAlign: 'center', marginTop: 32 }}>No users found.</Text>}
      />
    </View>
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
    borderBottomColor: colors.gray[200],
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
    borderBottomColor: colors.primary,
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
    borderBottomColor: colors.gray[100],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[200],
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