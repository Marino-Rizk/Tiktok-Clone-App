import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { apiCall } from "../../utils/api";
import { useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { wp, hp, validateForm } from "../../utils/helpers";

function LoginScreen() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidation = () => {
    const error = validateForm(formData);
    setError(error);
    return !error;
  };

  async function loginHandler() {
    setError('');
    if (!handleValidation()) return;
    setIsLoading(true);
    setIsAuthenticating(true);

    console.log(formData.email + " - " + formData.password);
    router.navigate('/(tabs)')
    /*
    try {
      let res = await apiCall("post", "/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log("res " + JSON.stringify(res));

      if (res.success) {
        // go to homepage
        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;
        const user = res.data.user;
        // authCtx.authenticate(accessToken, refreshToken, user);
      } else {
        console.log(res.data);
        console.log(res.data.errorCode);
        setIsAuthenticating(false);
        if (res.data.errorCode == "forbidden") {
          // call send otp api
          router.replace({
            pathname: "/Auth/OtpScreen",
            params: { email: formData.email },
          });
        } else {
          // Alert.alert("Error", res.data.errorMessage, [
          //   { text: "Cancel", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
          //   { text: "OK", onPress: () => console.log("OK Pressed") },
          // ]);
        }
      }
    } catch (error) {
      // Alert.alert(
      //   "Authentication failed!",
      //   "Could not log you in. Please check your credentials or try again later!"
      // );
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
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[{padding:spacing.lg,width:wp('100%')}]}>
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
            onPress={loginHandler}
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
      </View>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
