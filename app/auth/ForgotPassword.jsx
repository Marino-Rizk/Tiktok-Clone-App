import { useState } from "react";
import { Text } from "react-native";
import AuthContent from "../../components/Auth/AuthContent";
import { useRouter } from "expo-router";
// import { apiCall } from "../../utils/api";

function ForgotPassword() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  async function forgotPasswordHandler(formData) {
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
    setIsAuthenticating(false);
  }

  if (isAuthenticating) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthContent
      type="forgotPassword"
      onSubmit={forgotPasswordHandler}
    />
  );
}

export default ForgotPassword;
