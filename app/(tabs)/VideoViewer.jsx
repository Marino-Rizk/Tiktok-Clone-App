import React, { useRef, useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useVideoPlayer } from 'expo-video';
import VideoListItem from '../../components/VideoListItem';
import { wp, hp } from '../../utils/helpers';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../../constants/globalStyles';

// Mock video details fetcher
const mockVideoDetails = {
  vid6789: {
    id: 'vid6789',
    video_url: 'https://cdn.example.com/videos/vid6789.mp4',
    thumbnail_url: 'https://cdn.example.com/videos/thumb/vid6789.jpg',
    like_count: 5000,
    comment_count: 200,
    created_at: '2025-06-30T08:30:00Z',
    caption: 'Check out my latest video!',
    username: 'cool_creator',
    profile_picture_url: 'https://cdn.example.com/profiles/12345.jpg',
  },
  vid6790: {
    id: 'vid6790',
    video_url: 'https://cdn.example.com/videos/vid6790.mp4',
    thumbnail_url: 'https://cdn.example.com/videos/thumb/vid6790.jpg',
    like_count: 3200,
    comment_count: 150,
    created_at: '2025-06-28T10:00:00Z',
    caption: 'Another awesome moment!',
    username: 'cool_creator',
    profile_picture_url: 'https://cdn.example.com/profiles/12345.jpg',
  },
  vid6791: {
    id: 'vid6791',
    video_url: 'https://cdn.example.com/videos/vid6791.mp4',
    thumbnail_url: 'https://cdn.example.com/videos/thumb/vid6791.jpg',
    like_count: 2100,
    comment_count: 80,
    created_at: '2025-06-25T14:20:00Z',
    caption: 'Throwback vibes!',
    username: 'cool_creator',
    profile_picture_url: 'https://cdn.example.com/profiles/12345.jpg',
  },
};

const fetchVideoDetails = async (id) => {
  await new Promise((res) => setTimeout(res, 200));
  return mockVideoDetails[id];
};

export default function VideoViewer() {
  const route = useRoute();
  const { videos, initialIndex = 0, user } = route.params || {};
  const flatListRef = useRef(null);
  const [videoDetailsMap, setVideoDetailsMap] = useState({});
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isPlayingStates, setIsPlayingStates] = useState({});
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  // Create video player
  const player = useVideoPlayer(null);

  // Transform data to match VideoListItem expectations
  const transformVideoData = (details) => {
    return {
      id: details.id,
      uri: details.video_url,
      likes: details.like_count,
      comments: details.comment_count,
      shares: 0, // Add default shares count
      username: details.username,
      caption: details.caption,
      profileImage: details.profile_picture_url,
      isLiked: false, // Add default like state
      thumbnail: details.thumbnail_url,
      createdAt: details.created_at,
    };
  };

  // Event handlers
  const handleSingleTap = (videoId) => {
    setIsPlayingStates(prev => ({
      ...prev,
      [videoId]: { isPlaying: !prev[videoId]?.isPlaying }
    }));
  };

  const handleDoubleTap = (videoId) => {
    // Handle double tap (like functionality)
    handleLike(videoId);
  };

  const handleLike = (videoId) => {
    setVideoDetailsMap(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        like_count: prev[videoId]?.like_count + (prev[videoId]?.isLiked ? -1 : 1),
        isLiked: !prev[videoId]?.isLiked
      }
    }));
  };

  const handleShare = (videoUri) => {
    // Implement share functionality
    console.log('Sharing video:', videoUri);
  };

  const handleProfilePress = (username) => {
    // Navigate to profile
    console.log('Navigate to profile:', username);
  };

  // Fetch details for the initial video and as user swipes
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index;
      const video = videos[idx];

      if (video) {
        setCurrentVideoId(video.id);

        // Load video in player
        if (videoDetailsMap[video.id]) {
          player.replace(videoDetailsMap[video.id].video_url);
        }

        // Fetch details if not already loaded
        if (!videoDetailsMap[video.id]) {
          fetchVideoDetails(video.id).then((details) => {
            setVideoDetailsMap((prev) => ({
              ...prev,
              [video.id]: { ...details, isLiked: false }
            }));
            player.replace(details.video_url);
          });
        }
      }
    }
  }).current;

  useEffect(() => {
    // Preload the initial video
    if (videos && videos[initialIndex] && !videoDetailsMap[videos[initialIndex].id]) {
      const initialVideo = videos[initialIndex];
      setCurrentVideoId(initialVideo.id);

      fetchVideoDetails(initialVideo.id).then((details) => {
        setVideoDetailsMap((prev) => ({
          ...prev,
          [initialVideo.id]: { ...details, isLiked: false }
        }));
        player.replace(details.video_url);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex, videos]);

  const renderItem = ({ item }) => {
    const details = videoDetailsMap[item.id];

    if (!details) {
      return (
        <View style={{ height: hp(100), width: wp(100) }}>
          {/* Loading state */}
        </View>
      );
    }

    // Transform the data to match VideoListItem expectations
    const transformedItem = transformVideoData(details);

    return (
      <View style={{ height: hp(100), width: wp(100) }}>
        <VideoListItem
          item={transformedItem}
          player={player}
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
      </View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: hp(100),
    offset: hp(100) * index,
    index,
  });

  if (!videos || videos.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Add empty state component here */}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1,backgroundColor:colors.black }}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={1}
        decelerationRate="fast"
      />
    </GestureHandlerRootView>
  );
}