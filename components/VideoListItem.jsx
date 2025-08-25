import React, { useEffect, useCallback, useState } from 'react';
import { View, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import VideoActions from './VideoActions';
import VideoProgressBar from './VideoProgressBar';
import { wp, hp } from '../utils/helpers';
import { globalStyles, styles, colors, pauseIconStyles } from '../constants/globalStyles';
import { useEventListener } from 'expo';

export default function VideoListItem({
  item,
  currentVideoId,
  handleSingleTap,
  handleDoubleTap,
  handleLike,
  onOpenComments,
  handleShare,
  handleProfilePress,
  handleFollowPress,
  isCommentModalVisible,
}) {
  // item fields expected: id, uri, caption, username, profileImage, likes, comments, shares, isLiked
  const [playbackStatus, setPlaybackStatus] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false
  });

  // Create video player for this item
  const player = useVideoPlayer(item.uri, player => {
    player.loop = true;
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

  useEventListener(player, 'playingChange', (payload) => {
    setPlaybackStatus((prev) => ({
      ...prev,
      isPlaying: payload.isPlaying || false,
    }));
  });


  const onSingleTap = useCallback(() => {
    try {
      if (player) {
        if (playbackStatus.isPlaying) {
          player.pause();
        } else {
          player.play();
        }
      }
      // Only call if provided
      if (handleSingleTap) {
        handleSingleTap(item.id);
      }
    } catch (error) {
      console.log('Single tap error:', error);
    }
  }, [handleSingleTap, item.id, player, playbackStatus.isPlaying]);

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

  const isCurrentlyPlaying = playbackStatus.isPlaying && item.id === currentVideoId;

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
          bottom: hp(8),
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
        onComment={onOpenComments ? () => onOpenComments(item.id) : undefined}
        onShare={() => handleShare(item.uri)}
        onProfilePress={() => handleProfilePress(item)}
        onFollowPress={typeof item.isFollowing === 'boolean' ? () => handleFollowPress(item) : undefined}
        isFollowing={typeof item.isFollowing === 'boolean' ? item.isFollowing : undefined}
      />
    </View>
  );
}