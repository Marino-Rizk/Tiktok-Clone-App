import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';

export default function Create() {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.cameraContainer}>
        <Text style={[typography.h2, { color: colors.white }]}>Camera Preview</Text>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={[globalStyles.button, styles.recordButton]}>
          <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.button, styles.uploadButton]}>
          <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[500],
  },
  controlsContainer: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: colors.primary,
    width: 120,
  },
  uploadButton: {
    backgroundColor: colors.secondary,
    width: 120,
  },
}); 