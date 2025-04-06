// app/auth/_layout.js
import { Stack, Text, useRouter } from "expo-router";

export default function AuthLayout() {
  const router = useRouter();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" options={{ title: "login" }} />
      <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
      <Stack.Screen name="OtpScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
    </Stack>
  );
}
