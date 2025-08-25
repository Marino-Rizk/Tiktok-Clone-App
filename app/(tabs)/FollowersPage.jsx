import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { theme, typography, spacing } from '../../constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserFollowers, getUserFollowing, toggleFollowStatus } from '../../utils/userService';
import { defaultAvatar } from '../../constants/images';

const TABS = [
  { key: 'following', label: 'Following' },
  { key: 'followers', label: 'Followers' },
];

export default function FollowersPage({ route }) {
  const navigation = useNavigation();
  const initialTab = route?.params?.initialTab || 'followers';
  const userId = route?.params?.userId;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState({});

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: 1,
        ...(userId && { userId })
      };

      let response;
      if (activeTab === 'followers') {
        response = await getUserFollowers(options);
      } else if (activeTab === 'following') {
        response = await getUserFollowing(options);
      } else {
        // For likes tab, show empty state for now
        setUsers([]);
        setLoading(false);
        return;
      }

      if (response.success) {
        const usersData = response.data.followers || response.data.following || [];
        setUsers(usersData);
      } else {
        setError(response.error.message);
        setUsers([]);
      }
    } catch (err) {
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users based on active tab
  useEffect(() => {
    fetchUsers();
  }, [activeTab, userId]);

  // Refetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [activeTab, userId])
  );

  const handleFollowToggle = async (userId) => {
    try {
      const user = users.find(u => (u._id || u.id) === userId);
      if (!user) return;

      // Prevent multiple taps
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      const response = await toggleFollowStatus(userId, user.isFollowing);
      
      if (response.success) {
        setUsers(prev => prev.map(u => 
          (u._id || u.id) === userId 
            ? { ...u, isFollowing: !u.isFollowing }
            : u
        ));
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const renderUserItem = ({ item, index }) => {
    return (
      <View style={styles.userItem} key={item._id || `user-${index}`}>
        <Image 
          source={(item.imageUrl || item.profilePicture || item.profile_picture_url) ? { uri: item.imageUrl || item.profilePicture || item.profile_picture_url } : defaultAvatar} 
          defaultSource={defaultAvatar}
          style={styles.avatar} 
        />
        <Text style={[typography.body, { color: theme.text, flex: 1, marginLeft: 12 }]}>
          {item.userName || item.username || 'Unknown User'}
        </Text>
        {(activeTab === 'followers' || activeTab === 'following') && (
          <TouchableOpacity
            style={[
              styles.followBtn, 
              { 
                backgroundColor: item.isFollowing ? theme.subtext : theme.primary,
                opacity: followLoading[item._id || item.id] ? 0.6 : 1
              }
            ]}
            onPress={() => handleFollowToggle(item._id || item.id)}
            disabled={followLoading[item._id || item.id]}
          >
            <Text style={{ color: theme.text, fontWeight: '600' }}>
              {followLoading[item._id || item.id] 
                ? '...' 
                : (item.isFollowing ? 'Unfollow' : 'Follow')
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.body, { color: theme.subtext }]}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1, textAlign: 'center' }]}>
          {TABS.find(tab => tab.key === activeTab)?.label || 'Users'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
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
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[typography.body, { color: 'red' }]}>{error}</Text>
        </View>
      )}
      
      {/* List */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item._id || item.id || `user-${item.userName || item.username}`}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
}); 