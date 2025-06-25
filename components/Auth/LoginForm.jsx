import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Input from '../ui/Input';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { useRouter } from 'expo-router';

export default function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;
    setIsLoading(true);
    await onSubmit(formData);
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{height:'auto',padding:spacing.lg,backgroundColor:'white'}}>
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl }]}>Login to Tiktok</Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: colors.gray[400] }]}>Manage your account, check notifications, comment on videos, and more.</Text>
          <Input
            type="email"
            icon="mail-outline"
            placeholder="Email"
            formData={formData.email}
            handleInputChange={(value) => handleInputChange('email', value)}
            isLoading={isLoading}
          />
          <Input
            type="password"
            icon="lock-closed-outline"
            placeholder="Password"
            formData={formData.password}
            handleInputChange={(value) => handleInputChange('password', value)}
            isLoading={isLoading}
          />
          {error ? <Text style={[globalStyles.textCenter,globalStyles.textError]}>{error}</Text> : null}
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              isLoading && globalStyles.buttonDisabled,
              { marginTop: spacing.xl }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.md }}
            onPress={() => router.replace('/auth/SignupScreen')}
            disabled={isLoading}
          >
            <Text style={[globalStyles.textCenter,typography.caption ,{color:colors.primary}]}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.sm }}
            onPress={() => router.replace('/auth/ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={[globalStyles.textCenter,typography.caption, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
} 