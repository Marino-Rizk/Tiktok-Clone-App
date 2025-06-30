import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, validateForm } from "../../utils/helpers";
// import { apiCall } from "../../utils/api";

function ForgotPassword() {
  const [formData, setFormData] = useState({ email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendTimer]);

  const handleInputChange = (value) => {
    setFormData({ email: value });
  };

  const handleValidation = () => {
    const error = validateForm(formData);
    setError(error);
    return !error;
  };

  async function forgotPasswordHandler() {
    setError('');
    if (!handleValidation()) return;
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
    // To-Do: remove mock logic
    setLinkSent(true);
    setResendTimer(60);
    setIsLoading(false);
    setIsAuthenticating(false);
  }

  async function resendLinkHandler() {
    if (resendTimer > 0) return;
    console.log("Resending link to", formData.email);
    // To-Do: Implement actual resend logic, probably similar to forgotPasswordHandler
    setResendTimer(60);
  }

  if (isAuthenticating) {
    return <Text>Loading...</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', width: wp('100%'), padding: spacing.lg }]}>
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

        {!linkSent ? (
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              isAuthenticating && globalStyles.buttonDisabled,
              { marginTop: spacing.xl },
            ]}
            onPress={forgotPasswordHandler}
            disabled={isAuthenticating}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Send Link</Text>
            )}
          </TouchableOpacity>
        ) : (
            <TouchableOpacity
              style={[
                globalStyles.button,
                globalStyles.buttonPrimary,
                (isAuthenticating || resendTimer > 0) && globalStyles.buttonDisabled,
                { marginTop: spacing.xl },
              ]}
              onPress={resendLinkHandler}
              disabled={isAuthenticating || resendTimer > 0}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[globalStyles.buttonText]}>
                  {resendTimer > 0 ? `Resend Link in ${resendTimer}s` : 'Resend Link'}
                </Text>
              )}
            </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

export default ForgotPassword;
