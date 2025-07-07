import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, useColorScheme, Alert } from 'react-native';
import { colors, typography, spacing } from '../../constants/globalStyles';
import { useNavigation } from '@react-navigation/native';

const mockProfile = {
  display_name: 'Cool Creator',
  username: 'cool_creator',
  profile_picture_url: 'https://picsum.photos/200/200',
};

export default function EditProfile() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? colors.black : colors.white;
  const textColor = isDark ? colors.white : colors.black;
  const secondaryText = isDark ? colors.gray[300] : colors.gray[400];
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState(mockProfile.display_name);
  const [username, setUsername] = useState(mockProfile.username);
  const [profilePic, setProfilePic] = useState(mockProfile.profile_picture_url);

  const handleSave = () => {
    // Implement save logic (API call)
    Alert.alert('Profile Updated', 'Your profile has been updated.');
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <Text style={[typography.h2, { color: textColor, marginBottom: spacing.lg }]}>Edit Profile</Text>
      <View style={styles.avatarSection}>
        <Image source={{ uri: profilePic }} style={styles.avatar} />
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
          onPress={() => setProfilePic(`https://picsum.photos/200/200?random=${Math.floor(Math.random()*1000)}`)}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>Upload Image</Text>
        </TouchableOpacity>
      </View>
      <Text style={[typography.label, { color: secondaryText }]}>Display Name</Text>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: secondaryText }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display Name"
        placeholderTextColor={secondaryText}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.gray[400] }]} onPress={handleCancel}>
          <Text style={[typography.body, { color: textColor, fontWeight: '600' }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={[typography.body, { color: colors.white, fontWeight: '600' }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: spacing.md,
    fontSize: 16,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  uploadBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
}); 