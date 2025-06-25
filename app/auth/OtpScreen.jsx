import { StyleSheet } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../store/auth-context";
import AuthContent from "../../components/Auth/AuthContent";
import { useLocalSearchParams, useRouter } from "expo-router";
//import {apiCall } from "../../utils/api"; 

const OtpScreen = () => {
  const authCtx = useContext(AuthContext);
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

  const verifyOtp = async (otpNumber) => {
    setIsAuthenticating(true);

    /*
    try {
      // Call the backend to verify the OTP
      const res = await apiCall("post", "/auth/verify-otp", {
        email: email,
        otp: otpNumber,
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
    if (otpNumber === mockOTP) {
      console.log("OTP Verified:", otpNumber);
      router.replace("/(tabs)");
    } else {
      console.log("Incorrect OTP:", otpNumber);
    }
    setIsAuthenticating(false);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    console.log("📨 Resending OTP to", email);
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
    <AuthContent
      type="otp"
      onSubmit={verifyOtp}
      isAuthenticating={isAuthenticating}
      resendOtp={resendOtp}
      resendTimer={resendTimer}
    />
  );
};

export default OtpScreen;

const styles = StyleSheet.create({});
