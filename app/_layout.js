import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
//import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   checkAuthStatus();
  // }, []);

  // const checkAuthStatus = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     setIsAuthenticated(!!token);
  //   } catch (error) {
  //     console.error('Error checking auth status:', error);
  //     setIsAuthenticated(false);
  //   }
  // };

  if (isAuthenticated === null) {
    return null; // Or a loading screen
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}>
      {!isAuthenticated ? (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
} 