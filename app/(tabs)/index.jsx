import { View, StyleSheet, FlatList, Share } from 'react-native';
import React, { useState, useCallback } from 'react';
import { colors, globalStyles } from '../../constants/globalStyles';
import { hp, wp } from '../../utils/helpers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEvent } from 'expo';
import { useVideoPlayer } from 'expo-video';
import VideoListItem from '../../components/VideoListItem';

const initialVideos = [
  {
    id: '1',
    uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    caption: 'Big Buck Bunny is a short computer-animated comedy film.',
    username: 'blender',
    profileImage: 'https://i.pravatar.cc/150?u=blender',
    likes: 123,
    comments: 24,
    shares: 10,
    isLiked: false,
  },
  {
    id: '2',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    caption: 'For Bigger Fun',
    username: 'google',
    profileImage: 'https://i.pravatar.cc/150?u=google',
    likes: 456,
    comments: 50,
    shares: 20,
    isLiked: false,
  },
  {
    id: '3',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'Elephants Dream',
    username: 'dreamworks',
    profileImage: 'https://i.pravatar.cc/150?u=dreamworks',
    likes: 789,
    comments: 120,
    shares: 50,
    isLiked: false,
  },
];

export default function Home() {
  const [videos, setVideos] = useState(initialVideos);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideos[0].id);

  // Store player instances for each video
  const players = videos.reduce((acc, video) => {
    acc[video.id] = useVideoPlayer(video.uri, player => {
      player.loop = true;
    });
    return acc;
  }, {});

  // Helper to get isPlaying state for each video
  const isPlayingStates = videos.reduce((acc, video) => {
    acc[video.id] = useEvent(players[video.id], 'playingChange', { isPlaying: players[video.id]?.playing });
    return acc;
  }, {});

  const handleLike = (videoId) => {
    setVideos(currentVideos =>
      currentVideos.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            isLiked: !video.isLiked,
            likes: video.isLiked ? video.likes - 1 : video.likes + 1,
          };
        }
        return video;
      })
    );
  };

  const handleSingleTap = (videoId) => {
    const player = players[videoId];
    const isPlaying = isPlayingStates[videoId]?.isPlaying;
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const handleDoubleTap = (videoId) => {
    handleLike(videoId);
  };

  const handleShare = async (videoUri) => {
    try {
      await Share.share({
        message: 'Check out this awesome TikTok video!',
        url: videoUri,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleProfilePress = () => {
    console.log('Navigate to user profile');
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleId = viewableItems[0].item.id;
      setCurrentVideoId(visibleId);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.videoContainer}>
          <FlatList
            data={videos}
            pagingEnabled
            snapToAlignment="center"
            snapToInterval={hp(100)}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VideoListItem
                item={item}
                player={players[item.id]}
                isPlayingStates={isPlayingStates}
                currentVideoId={currentVideoId}
                handleSingleTap={handleSingleTap}
                handleDoubleTap={handleDoubleTap}
                handleLike={handleLike}
                setIsCommentModalVisible={setIsCommentModalVisible}
                handleShare={handleShare}
                handleProfilePress={handleProfilePress}
                isCommentModalVisible={isCommentModalVisible}
              />
            )}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  videoContainer: {
    width: wp(100),
    height: hp(100),
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

