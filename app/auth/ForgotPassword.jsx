import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { Ionicons } from '@expo/vector-icons';
// import { apiCall } from "../../utils/api";

function ForgotPassword() {
  const [formData, setFormData] = useState({ email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const handleInputChange = (value) => {
    setFormData({ email: value });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required   ');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email    ');
      return false;
    }
    return true;
  };

  async function forgotPasswordHandler() {
    setError('');
    if (!validateForm()) return;
    setIsLoading(true);
    setIsAuthenticating(true);
    
    console.log("Reset request sent for email:", formData.email);
    // router.push({ pathname: "/otp", params: { email: formData.email } });
    /*
    try {
      const res = await apiCall("post", "/auth/forgot-password", {
        email: formData.email,
      });
      if (res.success) {
        router.push({ pathname: "/otp", params: { email: formData.email } });
      } else {
        // Alert.alert("Error", res.data.message || "Unable to send reset email.");
      }
    } catch (e) {
      // Alert.alert("Network Error", "Please try again later.");
    } finally {
      setIsAuthenticating(false);
    }
    */
    setIsLoading(false);
    setIsAuthenticating(false);
  }

  if (isAuthenticating) {
    return <Text>Loading...</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', width: '100%', padding: spacing.lg }]}>
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg, padding: 8 }}
          onPress={() => router.replace('/auth/LoginScreen')}
          disabled={isAuthenticating}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
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
            onPress={forgotPasswordHandler}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

export default ForgotPassword;
