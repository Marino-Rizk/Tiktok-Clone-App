import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Image, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, globalStyles } from '../constants/globalStyles';
import { hp, wp, timeAgo } from '../utils/helpers';
import { buildAbsoluteUrl } from '../utils/api';
import { defaultAvatar } from '../constants/images';
import { getComments as fetchCommentsApi, addComment as addCommentApi } from '../utils/videoService';

const CommentModal = ({ visible, onClose, comments = [], onSend, sending = false, currentUserImage, videoId, autoFetch = false }) => {
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      let result = true;
      if (onSend) {
        result = await onSend(text);
      } else if (videoId) {
        const res = await addCommentApi(videoId, text);
        if (res.success) {
          setLocalComments(prev => [res.data.comment, ...prev]);
          result = true;
        } else {
          result = false;
        }
      }
      if (result !== false) {
        setCommentText('');
      }
    } catch (e) {
      // keep the text so user can retry
    }
  };

  useEffect(() => {
    const maybeFetch = async () => {
      if (!visible || !autoFetch || !videoId) return;
      try {
        setLoading(true);
        const res = await fetchCommentsApi(videoId);
        if (res.success) {
          setLocalComments(res.data.comments || []);
        } else {
          setLocalComments([]);
        }
      } finally {
        setLoading(false);
      }
    };
    maybeFetch();
  }, [visible, autoFetch, videoId]);

  const renderComment = ({ item }) => {
    const userName = (item.userId && item.userId.userName) || item.username || 'user';
    const displayName = (item.userId && item.userId.displayName) || userName;
    const rawImage = (item.userId && item.userId.imageUrl) || item.userImage;
    const userImage = rawImage ? buildAbsoluteUrl(rawImage) : null;
    const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();
    return (
      <View style={styles.commentItem}>
        {userImage ? (
          <Image source={{ uri: userImage }} style={styles.userImage} />
        ) : (
          <Image source={defaultAvatar} style={styles.userImage} />
        )}
        <View style={styles.commentContent}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{userName}</Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentActions}>
            <Text style={styles.timeText}>{timeAgo(createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Comments</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={(comments && comments.length > 0) ? comments : localComments}
                renderItem={renderComment}
                keyExtractor={(item) => (item.id || item._id || Math.random().toString())}
                contentContainerStyle={styles.commentsList}
              />

              <View style={styles.inputContainer}>
                {currentUserImage ? (
                  <Image 
                    source={{ uri: buildAbsoluteUrl(currentUserImage) }} 
                    style={styles.inputUserImage} 
                  />
                ) : (
                  <Image 
                    source={defaultAvatar} 
                    style={styles.inputUserImage} 
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.gray[400]}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!commentText.trim() || sending) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendComment}
                  disabled={!commentText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size={20} color={colors.primary} />
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={commentText.trim() ? colors.primary : colors.gray[400]} 
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: hp(70),
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.black,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.black,
    marginRight: spacing.xs,
  },
  commentsList: {
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  userImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: spacing.md,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    ...typography.body,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  commentText: {
    ...typography.body,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...typography.caption,
    color: colors.gray[400],
    marginRight: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  inputUserImage: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.black,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentModal; 