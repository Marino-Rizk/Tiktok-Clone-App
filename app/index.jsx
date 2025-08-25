import { useContext, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { globalStyles } from '../constants/globalStyles';
import { AuthContext } from '../store/auth-context';

export default function Index() {
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

  return <Redirect href="/auth/LoginScreen" />;
} 