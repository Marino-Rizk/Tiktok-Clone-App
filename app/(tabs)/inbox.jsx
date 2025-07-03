import { View, Text, StyleSheet, FlatList, RefreshControl, useColorScheme } from 'react-native';
import React, { useState, useCallback } from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { useNavigation } from '@react-navigation/native';
import NotificationItem from '../../components/NotificationItem';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'like',
    fromUser: {
      id: 'u1',
      username: 'Alice',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    targetVideo: {
      id: 'v1',
      thumbnail: 'https://placehold.co/80x120',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    fromUser: {
      id: 'u2',
      username: 'Bob',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    targetVideo: {
      id: 'v2',
      thumbnail: 'https://placehold.co/80x120',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    fromUser: {
      id: 'u3',
      username: 'Charlie',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
  {
    id: '4',
    type: 'mention',
    fromUser: {
      id: 'u4',
      username: 'Diana',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    targetVideo: {
      id: 'v3',
      thumbnail: 'https://placehold.co/80x120',
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    read: false,
  },
];

export default function Inbox() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? colors.black : colors.white;
  const textColor = isDark ? colors.white : colors.black;
  const secondaryText = isDark ? colors.gray[300] : colors.gray[500];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleNotificationPress = (notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.type === 'follow') {
      navigation.navigate('Profile', { userId: notification.fromUser.id });
    } else if (notification.targetVideo) {
      navigation.navigate('Video', { videoId: notification.targetVideo.id });
    } else {
      navigation.navigate('Profile', { userId: notification.fromUser.id });
    }
  };

  const renderItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
      isDark={isDark}
    />
  );

  return (
    <View style={[globalStyles.container, styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[typography.h2, { color: textColor }]}>Activity</Text>
      </View>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
          <Text style={[typography.body, { color: secondaryText, textAlign: 'center' }]}>No activity yet. Interactions will appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
}); 