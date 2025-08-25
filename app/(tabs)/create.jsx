import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadVideo, validateVideoUploadData } from '../../utils/videoService';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { guessMimeFromUri, normalizeMime, normalizePickedAsset, assetsAreSame } from '../../utils/helpers';

export default function Create() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  // Resolve mediaTypes for ImagePicker across SDK versions
  const supportsMediaTypeEnum = !!ImagePicker?.MediaType;
  const VIDEO_MEDIA_TYPES = supportsMediaTypeEnum
    ? [ImagePicker.MediaType.video]
    : ImagePicker.MediaTypeOptions?.Videos;
  const IMAGE_MEDIA_TYPES = supportsMediaTypeEnum
    ? [ImagePicker.MediaType.image]
    : ImagePicker.MediaTypeOptions?.Images;

  // Request permission once
  useEffect(() => {
    (async () => {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const isGranted = permission?.granted ?? permission?.status === 'granted';
        if (!isGranted) {
          Alert.alert('Permission required', 'We need media library access to pick videos and images.');
        }
      } catch (e) {
        // no-op
      }
    })();
  }, []);

  const player = useVideoPlayer(undefined, (playerInstance) => {
    try {
      playerInstance.setIsMuted?.(true);
      playerInstance.setIsLooping?.(true);
      playerInstance.play?.();
    } catch (e) {
      // no-op
    }
  });

  useEffect(() => {
    if (selectedVideo?.uri) {
      (async () => {
        try {
          if (player.replaceAsync) {
            await player.replaceAsync(selectedVideo.uri);
          } else {
            player.replace(selectedVideo.uri);
          }
          player.play?.();
        } catch (e) {
          // no-op fallback for player replace errors
        }
      })();
    } else {
      try {
        player.pause?.();
      } catch { }
    }
  }, [selectedVideo, player]);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: VIDEO_MEDIA_TYPES,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const normalized = normalizePickedAsset(asset, 'video');
        if (!assetsAreSame(normalized, selectedVideo)) {
          setSelectedVideo(normalized);
        }
      }
    } catch (error) {
      console.error('[Create] pickVideo error', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPES,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const normalized = normalizePickedAsset(asset, 'image');
        if (!assetsAreSame(normalized, selectedThumbnail)) {
          setSelectedThumbnail(normalized);
        }
      }
    } catch (error) {
      console.error('[Create] pickThumbnail error', error);
      Alert.alert('Error', 'Failed to pick thumbnail');
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    if (!selectedThumbnail) {
      Alert.alert('Error', 'Please select a thumbnail first');
      return;
    }

    const videoData = {
      videoFile: selectedVideo,
      thumbnailFile: selectedThumbnail,
      caption: caption?.trim() || '',
    };

    // Validate upload data
    const validation = validateVideoUploadData(videoData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', Object.values(validation.errors)[0]);
      return;
    }

    try {
      setUploading(true);
      const response = await uploadVideo(videoData);

      if (response.success) {
        Alert.alert('Success', 'Video uploaded successfully!');
        setSelectedVideo(null);
        setSelectedThumbnail(null);
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.cameraContainer}>
        <View style={styles.previewContainer}>
          <View style={styles.previewWrapper}>
            {selectedVideo?.uri ? (
              <VideoView
                player={player}
                allowsFullscreen
                allowsPictureInPicture
                style={styles.previewMedia}
              />
            ) : (
              <View style={[styles.previewMedia, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card }]}>
                <Text style={[typography.body, { color: theme.subtext }]}>Select Video or Thumbnail     </Text>
              </View>
            )}
            {selectedThumbnail?.uri && (
              <Image source={{ uri: selectedThumbnail.uri }} style={styles.thumbnailOverlay} />
            )}
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity
            style={[styles.button, styles.selectButton]}
            onPress={pickVideo}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, { fontSize: 16 }]}>
              {selectedVideo ? 'Replace Video' : 'Select Video'}
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.button, styles.selectButton]}
            onPress={pickThumbnail}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, { fontSize: 16 }]}>
              {selectedThumbnail ? 'Replace Thumbnail' : 'Select Thumbnail'}
            </Text>
          </TouchableOpacity>

        </View>
        <View >
          <Text style={[typography.body, { color: theme.subtext, marginBottom: 6 }]}>Caption</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor={theme.subtext}
            style={styles.captionInput}
            editable={!uploading}
            maxLength={2200}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.uploadButton, uploading && styles.buttonDisabled]}
          onPress={handleUpload}
          disabled={uploading || !selectedVideo || !selectedThumbnail}
        >
          <Text style={[styles.buttonText, { fontSize: 16 }]}>
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMedia: {
    aspectRatio: 9/16,
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewWrapper: {
    aspectRatio: 9/16,
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 80,
    height: 142,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00000055',
  },
  controlsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flexDirection: 'column',
    gap: spacing.md,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  selectButton: {
    backgroundColor: theme.primary,
  },
  uploadButton: {
    backgroundColor: theme.primary,
  },
  removeButton: {
    backgroundColor: '#B00020',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.text,
    fontWeight: '600',
  },
  
  captionInput: {
    backgroundColor: theme.card,
    color: theme.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
}); 