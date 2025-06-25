import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Input from '../ui/Input';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OtpForm({ onSubmit, isAuthenticating, resendOtp, resendTimer }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateForm = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;
    await onSubmit(otp);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={globalStyles.container}>
      <View style={[globalStyles.center, globalStyles.container, { padding: spacing.lg }]}> 
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg, padding: 8 }}
          onPress={() => router.replace('/auth/LoginScreen')}
          disabled={isAuthenticating}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl }]}>Enter OTP</Text>
        <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: colors.gray[400] }]}>Enter the 6-digit code sent to your email.</Text>
        <Input
          type="otp"
          icon="key-outline"
          placeholder="OTP Code"
          formData={otp}
          handleInputChange={setOtp}
          isLoading={isAuthenticating}
        />
        {error ? <Text style={globalStyles.textError}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            isAuthenticating && globalStyles.buttonDisabled,
            { marginTop: spacing.xl }
          ]}
          onPress={handleSubmit}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.center, { marginTop: spacing.lg }]}
          onPress={resendOtp}
          disabled={resendTimer > 0 || isAuthenticating}
        >
          <Text style={[typography.caption, { color: resendTimer > 0 ? colors.gray[400] : colors.primary }]}> 
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView >
  );
} 