import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { authAPI } from '../../utils/api';
import Input from '../ui/Input';
import { colors, typography, spacing, borderRadius, globalStyles } from '../../constants/globalStyles';

export default function AuthContent({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.username.trim()) {
        setError('Username is required');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        await authAPI.login(formData.email, formData.password);
      } else {
        await authAPI.register(formData.username, formData.email, formData.password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}>
      <ScrollView contentContainerStyle={[globalStyles.scrollContent, { padding: spacing.lg }, styles.container]}>

        <View >
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl }]}>
            {isLogin ? 'Login to' : 'Sign Up for'} Tiktok
          </Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: colors.gray[400] }]}>
            {isLogin ? 'Manage your account, check notifications, comment on videos, and more.' : 'Create an account to follow creators, like videos, comment, and more.'}
          </Text>
          {!isLogin && (
            <Input
              type="text"
              icon="person-outline"
              placeholder="Username"
              formData={formData.username}
              handleInputChange={(value) => handleInputChange('username', value)}
              isLoading={isLoading}
            />
          )}

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

          {!isLogin && (
            <Input
              type="password"
              icon="lock-closed-outline"
              placeholder="Confirm Password"
              formData={formData.confirmPassword}
              handleInputChange={(value) => handleInputChange('confirmPassword', value)}
              isLoading={isLoading}
            />
          )}

          {error ? <Text style={globalStyles.textError}>{error}</Text> : null}

          <TouchableOpacity 
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              isLoading && globalStyles.buttonDisabled,
              { marginTop: spacing.xl }
            ]} 
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.center, { marginTop: spacing.xl }]}
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={isLoading}>
            <Text style={[typography.caption, { color: colors.gray[400] }]}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
}); 