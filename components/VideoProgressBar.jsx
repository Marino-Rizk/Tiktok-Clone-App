import React from 'react';
import { View, PanGestureHandler, State } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export default function VideoProgressBar({ 
  currentTime, 
  duration, 
  onSeek, 
  style,
  trackColor = 'rgba(255, 255, 255, 0.3)',
  progressColor = '#fff',
  thumbColor = '#fff'
}) {
  const progress = duration > 0 ? currentTime / duration : 0;

  const handlePanGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Calculate position based on gesture
      const containerWidth = 300; // You might want to measure this dynamically
      const position = Math.max(0, Math.min(1, event.x / containerWidth));
      runOnJS(onSeek)(position);
    });

  const handleTapGesture = Gesture.Tap()
    .onEnd((event) => {
      const containerWidth = 300; // You might want to measure this dynamically
      const position = Math.max(0, Math.min(1, event.x / containerWidth));
      runOnJS(onSeek)(position);
    });

  const combinedGesture = Gesture.Race(handlePanGesture, handleTapGesture);

  return (
    <View style={[{
      height: 4,
      backgroundColor: trackColor,
      borderRadius: 2,
      overflow: 'hidden',
    }, style]}>
      <GestureDetector gesture={combinedGesture}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* Progress fill */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              backgroundColor: progressColor,
              borderRadius: 2,
            }}
          />
          
          {/* Thumb */}
          <View
            style={{
              position: 'absolute',
              left: `${progress * 100}%`,
              marginLeft: -6,
              width: 12,
              height: 12,
              backgroundColor: thumbColor,
              borderRadius: 6,
              top: -4,
            }}
          />
        </View>
      </GestureDetector>
    </View>
  );
}