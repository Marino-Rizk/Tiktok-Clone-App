import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, globalStyles } from '../constants/globalStyles';
import { hp, wp } from '../utils/helpers';
import CommentModal from './CommentModal';

const VideoActions = ({ 
  likes = 0, 
  comments = 0, 
  shares = 0, 
  username = 'username',
  caption = 'Video caption goes here',
  profileImage = 'https://picsum.photos/200',
  onLike,
  onComment,
  onShare,
  onProfilePress
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike && onLike(!isLiked);
  };

  const handleComment = () => {
    setIsCommentModalVisible(true);
    onComment && onComment();
  };

  const ActionButton = ({ icon, count, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Ionicons 
        name={icon} 
        size={38} 
        color={colors.white} 
      />
      <Text style={styles.actionCount}>{count}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={onProfilePress}
        >
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage} 
          />
          <View style={styles.followButton}>
            <Ionicons name="add" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>

        <ActionButton 
          icon={isLiked ? "heart" : "heart-outline"} 
          count={likes} 
          onPress={handleLike} 
        />
        <ActionButton 
          icon="chatbubble-outline" 
          count={comments} 
          onPress={handleComment} 
        />
        <ActionButton 
          icon="arrow-redo-outline" 
          count={shares} 
          onPress={onShare} 
        />
        <View style={styles.musicButton}>
          <Ionicons name="musical-notes" size={24} color={colors.white} />
        </View>
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.caption}>{caption}</Text>
        <View style={styles.musicContainer}>
          <Ionicons name="musical-notes" size={16} color={colors.white} />
          <Text style={styles.musicText}>Original sound - {username}</Text>
        </View>
      </View>

      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        comments={[
          {
            id: '1',
            username: 'user1',
            text: 'Great video!',
            time: '2h ago',
            userImage: 'https://picsum.photos/200'
          },
          {
            id: '2',
            username: 'user2',
            text: 'Love this content!',
            time: '1h ago',
            userImage: 'https://picsum.photos/201'
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(5),
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  rightActions: {
    position: 'absolute',
    right: spacing.lg,
    bottom: hp(0),
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  actionCount: {
    color: colors.white,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  profileButton: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  profileImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 2,
    borderColor: colors.white,
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.primary,
    borderRadius: wp(3),
    padding: spacing.xs,
  },
  musicButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: wp(6),
    padding: spacing.sm,
    transform: [{ rotate: '45deg' }],
  },
  captionContainer: {
    maxWidth: wp(70),
  },
  username: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  caption: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.sm,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: colors.white,
    fontSize: typography.caption.fontSize,
    marginLeft: spacing.xs,
  },
});

export default VideoActions; 