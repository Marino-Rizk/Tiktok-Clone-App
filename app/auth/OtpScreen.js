import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import AuthContent from "../../components/Auth/AuthContent";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiCall } from "../../utils/api";

const OtpScreen = () => {
  const authCtx = useContext(AuthContext);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

//   const params = useLocalSearchParams();
//   const { phoneNumber } = params;

//   console.log("phoneNumber " + phoneNumber);

//   const verifyOtp = async (otpNumber) => {
//     let res = await apiCall("post", "/auth/verifyOtp", {
//       phoneNumber: phoneNumber,
//       code: otpNumber,
//     });

//     console.log(JSON.stringify(res));

//     if (res.success) {
//       const accessToken = res.data.accessToken;
//       const refreshToken = res.data.refreshToken;
//       authCtx.authenticate(accessToken, refreshToken);
//       // authCtx.authenticate(accessToken);
//     } else {
//       console.log(JSON.stringify(res.data));
//     }
//   };

//   if (isAuthenticating) {
//     return <LoadingOverlay message="Creating user..." />;
//   }

  return (
    <AuthContent screen="otp" headerHeight={40} onAuthenticate={verifyOtp} />
  );
};

export default OtpScreen;

const styles = StyleSheet.create({});
