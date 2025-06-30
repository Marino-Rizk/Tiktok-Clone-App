import React, { useEffect, useCallback, useState } from 'react';
import { View, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import VideoActions from './VideoActions';
import CommentModal from './CommentModal';
import VideoProgressBar from './VideoProgressBar';
import { wp, hp } from '../utils/helpers';
import { globalStyles, styles, colors, pauseIconStyles } from '../constants/globalStyles';
import { useEventListener } from 'expo';

export default function VideoListItem({
  item,
  player,
  isPlayingStates,
  currentVideoId,
  handleSingleTap,
  handleDoubleTap,
  handleLike,
  setIsCommentModalVisible,
  handleShare,
  handleProfilePress,
  isCommentModalVisible,
}) {
  const [playbackStatus, setPlaybackStatus] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false
  });



  useEffect(() => {
    if (player) {
      player.timeUpdateEventInterval = 0.2;
      if (item.id === currentVideoId) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [currentVideoId, player, item.id]);

  useEventListener(player, 'timeUpdate', (payload) => {
    setPlaybackStatus((prev) => ({
      ...prev,
      currentTime: payload.currentTime || 0,
      duration: player.duration || 0,
    }));
  });

  useEventListener(player, 'sourceLoad', (payload) => {
    setPlaybackStatus((prev) => ({
      ...prev,
      duration: payload.duration || 0,
    }));
  });


  const onSingleTap = useCallback(() => {
    try {
      handleSingleTap(item.id);
    } catch (error) {
      console.log('Single tap error:', error);
    }
  }, [handleSingleTap, item.id]);

  const onDoubleTap = useCallback(() => {
    try {
      handleDoubleTap(item.id);
    } catch (error) {
      console.log('Double tap error:', error);
    }
  }, [handleDoubleTap, item.id]);

  const handleSeek = useCallback((position) => {
    if (player && playbackStatus.duration > 0) {
      const seekTime = position * playbackStatus.duration;
      player.currentTime = seekTime;
    }
  }, [player, playbackStatus.duration]);

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onDoubleTap)();
    });

  const composed = Gesture.Exclusive(doubleTap, singleTap);

  const isCurrentlyPlaying = isPlayingStates[item.id]?.isPlaying && item.id === currentVideoId;

  return (
    <View style={globalStyles.videoItem}>
      <GestureDetector gesture={composed}>
        <VideoView
          style={{ 
            flex: 1, 
            width: wp(100), 
            height: hp(100), 
            position: 'absolute', 
            top: 0, 
            left: 0 
          }}
          player={player}
          resizeMode="cover"
          allowsExternalPlayback={false}
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      </GestureDetector>

      {!isCurrentlyPlaying && item.id === currentVideoId && (
        <View style={pauseIconStyles.container}>
          <View style={pauseIconStyles.iconBackground}>
            <Ionicons 
              name="pause" 
              size={50} 
              color="white" 
            />
          </View>
        </View>
      )}

      <VideoProgressBar
        currentTime={playbackStatus.currentTime}
        duration={playbackStatus.duration}
        onSeek={handleSeek}
        style={{
          position: 'absolute',
          bottom: 1,
          left: 0,
          right: 0,
        }}
      />

      <VideoActions
        likes={item.likes}
        comments={item.comments}
        shares={item.shares}
        username={item.username}
        caption={item.caption}
        profileImage={item.profileImage}
        isLiked={item.isLiked}
        onLike={() => handleLike(item.id)}
        onComment={() => setIsCommentModalVisible(true)}
        onShare={() => handleShare(item.uri)}
        onProfilePress={handleProfilePress}
      />
    </View>
  );
}