import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';

export default function Inbox() {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.headerContainer}>
        <Text style={[typography.h2, { color: colors.black }]}>Inbox</Text>
        <TouchableOpacity>
          <Text style={[typography.body, { color: colors.primary }]}>Requests</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.messageContainer}>
          <Text style={typography.body}>No messages yet</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  contentContainer: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
}); 