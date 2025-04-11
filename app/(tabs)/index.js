import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';

const { width, height } = Dimensions.get('window');

export default function Home() {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.videoContainer}>
        <Text style={[typography.h2, { color: colors.white }]}>Video Feed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  videoContainer: {
    width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});