import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { theme, typography, spacing } from '../../constants/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockProfile = {
  display_name: 'Cool Creator',
  username: 'cool_creator',
  profile_picture_url: 'https://picsum.photos/200/200',
};

export default function EditProfile() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(mockProfile.display_name);
  const [username, setUsername] = useState(mockProfile.username);
  const [profilePic, setProfilePic] = useState(mockProfile.profile_picture_url);

  const handleSave = () => {
    Alert.alert('Profile Updated', 'Your profile has been updated.');
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
      <Text style={[typography.h2, { color: theme.text, marginBottom: spacing.lg }]}>Edit Profile</Text>
      <View style={styles.avatarSection}>
        <Image source={{ uri: profilePic }} style={styles.avatar} />
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: theme.primary }]} onPress={() => setProfilePic(`https://picsum.photos/200/200?random=${Math.floor(Math.random()*1000)}`)}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>Upload Image</Text>
        </TouchableOpacity>
      </View>
      <Text style={[{ color: theme.subtext, marginBottom: 4 }]}>Display Name</Text>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.subtext }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display Name"
        placeholderTextColor={theme.subtext}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.subtext }]} onPress={handleCancel}>
          <Text style={[{ color: theme.text, fontWeight: '600' }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Text style={[{ color: theme.text, fontWeight: '600' }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    borderColor: theme.primary,
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