import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Input from '../ui/Input';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordForm({ onSubmit }) {
  const [formData, setFormData] = useState({ email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (value) => {
    setFormData({ email: value });
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={{ padding: spacing.lg }}>
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg, padding: 8 }}
          onPress={() => router.replace('/auth/LoginScreen')}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={[globalStyles.center, globalStyles.container]}>
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl }]}>Forgot Password</Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: colors.gray[400] }]}>Enter your email to receive a password reset link.</Text>
          <Input
            type="email"
            icon="mail-outline"
            placeholder="Email"
            formData={formData.email}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
          />
          {error ? <Text style={globalStyles.textError}>{error}</Text> : null}
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
              <Text style={globalStyles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView >
  );
} 