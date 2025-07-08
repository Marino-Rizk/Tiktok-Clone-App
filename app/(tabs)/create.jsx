import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { theme, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Create() {
  return (
    <SafeAreaView style={[globalStyles.container, styles.container]} edges={["top","bottom","left","right"]}>
      <View style={styles.cameraContainer}>
        <Text style={[typography.h2, { color: theme.text }]}>Camera Preview</Text>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={[styles.button, styles.recordButton]}>
          <Text style={[styles.buttonText, { fontSize: 16 }]}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.uploadButton]}>
          <Text style={[styles.buttonText, { fontSize: 16 }]}>Upload</Text>
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
  controlsContainer: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  recordButton: {
    backgroundColor: theme.primary,
  },
  uploadButton: {
    backgroundColor: theme.secondary,
  },
  buttonText: {
    color: theme.text,
    fontWeight: '600',
  },
}); 