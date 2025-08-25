import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, globalStyles } from '../constants/globalStyles';
import { hp, wp } from '../utils/helpers';
import CommentModal from './CommentModal';
import { defaultAvatar } from '../constants/images';

const VideoActions = ({
  likes = 0,
  comments = 0,
  shares = 0,
  username = 'username',
  caption = 'Video caption goes here',
  profileImage,
  onLike,
  onComment,
  onShare,
  onProfilePress,
  onFollowPress,
  isLiked,
  isFollowing,
}) => {
  const likeScale = useRef(new Animated.Value(1)).current;
  const [localCommentVisible, setLocalCommentVisible] = useState(false);

  const handleLike = () => {
    
    onLike && onLike();
  };

  const handleComment = () => {
    if (onComment) {
      onComment();
    } else {
      setLocalCommentVisible(true);
    }
  };

  const ActionButton = ({ icon, count, onPress, isLiked = false, animated = false }) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={icon === 'chatbubble-outline' ? 'Open comments' : icon === 'heart' || icon === 'heart-outline' ? 'Like' : 'Share'}
    >
      <Animated.View style={animated ? { transform: [{ scale: likeScale }] } : {}}>
        <Ionicons
          name={icon}
          size={38}
          color={isLiked ? colors.primary : colors.white}
        />
      </Animated.View>
      <Text style={styles.actionCount}>{count} </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              defaultSource={defaultAvatar}
              style={styles.profileImage}
            />
          ) : (
            <Image
              source={defaultAvatar}
              style={styles.profileImage}
            />
          )}
          {!!onFollowPress && isFollowing === false && (
            <TouchableOpacity style={styles.followButton} onPress={onFollowPress}>
              <Ionicons name="add" size={16} color={colors.white} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <ActionButton
          icon={isLiked ? "heart" : "heart-outline"}
          count={likes}
          onPress={handleLike}
          isLiked={isLiked}
          animated={true}
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
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>

      {/* Fallback local modal when parent does not control comments */}
      <CommentModal
        visible={localCommentVisible && !onComment}
        onClose={() => setLocalCommentVisible(false)}
        comments={[]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: hp(11),
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  rightActions: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 0,
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
    bottom: -12,
    backgroundColor: colors.primary,
    borderRadius: wp(100),
    padding: spacing.xs,
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

});

export default VideoActions;