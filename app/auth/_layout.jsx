import { useContext } from "react";
import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { globalStyles } from "../../constants/globalStyles";

export default function AuthLayout() {
  const { isAuthenticated, isBootstrapping } = useContext(AuthContext);

  if (isBootstrapping) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen"/>
      <Stack.Screen name="SignupScreen"/>
      <Stack.Screen name="OtpScreen"/>
      <Stack.Screen name="ForgotPassword"/>
    </Stack>
  );
}
