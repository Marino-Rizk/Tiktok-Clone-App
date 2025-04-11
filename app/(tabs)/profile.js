import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import React from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';

export default function Profile() {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: 'https://picsum.photos/200' }}
            style={styles.profileImage}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[typography.h3, { color: colors.black }]}>0</Text>
              <Text style={[typography.caption, { color: colors.gray[400] }]}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.h3, { color: colors.black }]}>0</Text>
              <Text style={[typography.caption, { color: colors.gray[400] }]}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.h3, { color: colors.black }]}>0</Text>
              <Text style={[typography.caption, { color: colors.gray[400] }]}>Following</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[typography.h3, { color: colors.black }]}>Username</Text>
          <Text style={[typography.body, { color: colors.gray[400], marginTop: spacing.xs }]}>
            Bio goes here
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[typography.body, { color: colors.gray[400] }]}>No posts yet</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.xl,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: spacing.xl,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
}); 