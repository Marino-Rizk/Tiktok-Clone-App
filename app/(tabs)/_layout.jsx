import { useContext } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, theme } from '../../constants/globalStyles';
import { hp } from '../../utils/helpers';
import { AuthContext } from '../../store/auth-context';

export default function TabLayout() {
  const { isAuthenticated, isBootstrapping } = useContext(AuthContext);

  if (!isBootstrapping && !isAuthenticated) {
    return <Redirect href="/auth/LoginScreen" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[100],
        sceneContainerStyle: { backgroundColor: theme.background },
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopWidth: 0,
          borderTopColor: colors.black,
          height: hp(8),
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="UserProfile"
        options={{
          href: null, // This hides it from the tab bar
          title: 'User Profile',
        }}
      />
      <Tabs.Screen
        name="VideoViewer"
        options={{
          href: null, // This hides it from the tab bar
          title: 'Video Viewer',
        }}
      />
      <Tabs.Screen
        name="FollowersPage"
        options={{
          href: null, // Hide from tab bar
          title: 'Followers',
        }}
      />
      <Tabs.Screen
        name="EditProfile"
        options={{
          href: null, // Hide from tab bar
          title: 'Edit Profile',
        }}
      />
    </Tabs>
  );
} 