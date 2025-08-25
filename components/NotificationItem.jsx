import React from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { typography, spacing, colors } from '../constants/globalStyles';
import { defaultAvatar } from '../constants/images';
import { timeAgo } from '../utils/helpers';

function getNotificationText(type, fromUser, targetVideo) {
  switch (type) {
    case 'like':
      return `${fromUser.username} liked your video.`;
    case 'comment':
      return `${fromUser.username} commented on your video.`;
    case 'follow':
      return `${fromUser.username} followed you.`;
    case 'mention':
      return `${fromUser.username} mentioned you in a video.`;
    default:
      return '';
  }
}

export default function NotificationItem({ notification, onPress, isDark }) {
  const { type, fromUser, targetVideo, createdAt, read } = notification;
  const backgroundColor = isDark ? colors.gray[500] : colors.gray[100];
  const textColor = isDark ? colors.white : colors.black;
  const secondaryText = isDark ? colors.gray[300] : colors.gray[500];

  return (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor }, read && styles.readNotification]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={fromUser?.avatar ? { uri: fromUser.avatar } : defaultAvatar} defaultSource={defaultAvatar} style={styles.avatar} />
      <View style={styles.notificationContent}>
        <Text style={[typography.body, { color: textColor }]}>{getNotificationText(type, fromUser, targetVideo)}</Text>
        <Text style={[styles.timestamp, { color: secondaryText }]}>{timeAgo(createdAt)}</Text>
      </View>
      {targetVideo?.thumbnail && (
        <Image source={{ uri: targetVideo.thumbnail }} style={styles.thumbnail} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  readNotification: {
    opacity: 0.6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  thumbnail: {
    width: 48,
    height: 64,
    borderRadius: 8,
    marginLeft: spacing.md,
    backgroundColor: colors.gray[300],
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
}); 