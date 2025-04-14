import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Image, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, globalStyles } from '../constants/globalStyles';
import { hp, wp } from '../utils/helpers';

const CommentModal = ({ visible, onClose, comments = [] }) => {
  const [commentText, setCommentText] = useState('');

  const handleSendComment = () => {
    if (commentText.trim()) {
      // TODO: Implement comment submission
      setCommentText('');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.userImage }} style={styles.userImage} />
      <View style={styles.commentContent}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <Text style={styles.timeText}>{item.time}</Text>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="heart-outline" size={16} color={colors.gray[400]} />
            <Text style={styles.likeCount}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
              />

              <View style={styles.inputContainer}>
                <Image 
                  source={{ uri: 'https://picsum.photos/200' }} 
                  style={styles.inputUserImage} 
                />
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
                    !commentText.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendComment}
                  disabled={!commentText.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={commentText.trim() ? colors.primary : colors.gray[400]} 
                  />
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    ...typography.caption,
    color: colors.gray[400],
    marginLeft: spacing.xs,
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