import { View, Text, StyleSheet, FlatList } from 'react-native';
import React, { useState } from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { hp, wp } from '../../utils/helpers';
import VideoActions from '../../components/VideoActions';
import CommentModal from '../../components/CommentModal';
import { Share } from 'react-native';

export default function Home() {
  const videos = [1, 2, 4];
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = (liked) => {
    setIsLiked(liked);
    setLikesCount(prev => liked ? prev + 1 : prev - 1);
  };

  const handleComment = () => {
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out this awesome TikTok video!',
        url: 'https://tiktok.com/video/123',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // 
        } else {
          // 
        }
      } else if (result.action === Share.dismissedAction) {
        // 
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleProfilePress = () => {
    console.log('Navigate to user profile');
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.videoContainer}>
        <FlatList
          horizontal={false}
          data={videos}
          maxToRenderPerBatch={1}
          bounces={false}
          windowSize={1}
          pagingEnabled={true}
          snapToAlignment={'center'}
          snapToInterval={hp(100)}
          decelerationRate={'fast'}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            return (
              <View
                style={[
                  styles.videoItem,
                  { backgroundColor: index === 1 ? colors.primary : colors.gray[500] }
                ]}>
                <Text style={[typography.h2, { color: colors.white }]}>
                  Video {item}
                </Text>


                <VideoActions
                  likes={likesCount}
                  comments={0}
                  shares={0}
                  username="username"
                  caption="Video caption goes here"
                  profileImage="https://picsum.photos/200"
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onProfilePress={handleProfilePress}
                />
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
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  videoContainer: {
    width: wp(100),
    height: hp(100)-70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoItem: {
    width: wp(100),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
});