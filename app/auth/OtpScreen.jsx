import { StyleSheet } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { Ionicons } from '@expo/vector-icons';
//import {apiCall } from "../../utils/api"; 

const OtpScreen = () => {
  const authCtx = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { email } = useLocalSearchParams();
  const router = useRouter();

  const mockOTP = "123456";

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const validateForm = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return false;
    }
    return true;
  };

  const verifyOtp = async () => {
    setError('');
    if (!validateForm()) return;
    setIsAuthenticating(true);

    /*
    try {
      // Call the backend to verify the OTP
      const res = await apiCall("post", "/auth/verify-otp", {
        email: email,
        otp: otp,
      });
      if (res.success) {
        // Authenticate user with received token(s)
        // authCtx.authenticate(res.data.accessToken, res.data.refreshToken, res.data.user);
        router.replace("/(tabs)");
      } else {
        // Handle error (e.g., show alert)
        // Alert.alert("Invalid OTP", res.data.errorMessage || "The code you entered is incorrect.");
      }
    } catch (error) {
      // Alert.alert("Verification Failed", "Something went wrong. Try again.");
    } finally {
      setIsAuthenticating(false);
    }
    */
    if (otp === mockOTP) {
      console.log("OTP Verified:", otp);
      router.replace("/(tabs)");
    } else {
      console.log("Incorrect OTP:", otp);
    }
    setIsAuthenticating(false);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    console.log("Resending OTP to", email);
    /*
    try {
      await apiCall("post", "/auth/send-otp", { email });
      setResendTimer(30);
    } catch (error) {
      // Alert.alert("Error", "Could not resend OTP. Please try again.");
    }
    */
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', width: '100%', padding: spacing.lg }]}>
        <TouchableOpacity
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg, padding: 8 }}
          onPress={() => router.replace('/auth/SignupScreen')}
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
          onPress={verifyOtp}
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
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s  ` : 'Resend OTP  '}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({});
