import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { theme, typography, spacing } from '../../constants/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, updateUserProfile, validateProfileData } from '../../utils/userService';

export default function EditProfile() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        
        if (response.success) {
          setDisplayName(response.data.displayName || '');
          setUsername(response.data.userName || '');
          setProfilePic(response.data.imageUrl || '');
        } else {
          setError(response.error.message);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate input
      const validation = validateProfileData({ displayName });
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      // Update profile
      const response = await updateUserProfile({ displayName });
      
      if (response.success) {
        Alert.alert('Success', 'Your profile has been updated.');
        navigation.goBack();
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.body, { color: theme.subtext }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top","bottom","left","right"]}>
      <Text style={[typography.h2, { color: theme.text, marginBottom: spacing.lg }]}>Edit Profile</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[typography.body, { color: 'red' }]}>{error}</Text>
        </View>
      )}
      
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
        editable={!saving}
      />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.subtext }]} 
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={[{ color: theme.text, fontWeight: '600' }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[{ color: theme.text, fontWeight: '600' }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
}); 