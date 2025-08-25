import { Stack } from 'expo-router';
import AuthContextProvider from '../store/auth-context';
import { theme } from '../constants/globalStyles';

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthContextProvider>
  );
}