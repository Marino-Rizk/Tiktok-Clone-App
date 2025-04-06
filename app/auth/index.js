import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AuthContent from '../../components/Auth/AuthContent';

export default function AuthScreen() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Navigate to the main app
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <AuthContent onAuthSuccess={handleAuthSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
}); 