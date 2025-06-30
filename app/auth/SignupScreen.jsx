import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { useRouter } from "expo-router";
import { apiCall } from "../../utils/api";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { wp, hp, validateForm } from "../../utils/helpers";

function SignupScreen() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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

  async function signupHandler() {
    setError('');
    if (!handleValidation()) return;
    setIsLoading(true);
    setIsAuthenticating(true);

    console.log(formData.email + " - " + formData.password);
    router.replace({
      pathname: "/auth/OtpScreen",
      params: { email: formData.email },
    });
    /*
    try {
      let res = await apiCall("post", "/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      console.log("res :" + JSON.stringify(res));

      if (res.success) {
        // go to homepage
        const isVerified = res.data.isVerified;
        if (isVerified == 0) {
          router.replace({
            pathname: "/auth/OtpScreen",
            params: { email: formData.email },
          });
        }
        // const refreshToken = res.data.refreshToken;
        // authCtx.authenticate(accessToken, refreshToken);
      } else {
        console.log(res.data.errorCode);
        // Alert.alert("Authentication failed!", "User Already exist.");
        setIsAuthenticating(false);
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
        <View style={{ width:wp('100%'), padding: spacing.lg, backgroundColor: 'white' }}>
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl }]}>Sign Up for Tiktok</Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: colors.gray[400] }]}>Create an account to follow creators, like videos, comment, and more.</Text>
          <Input
            type="text"
            icon="person-outline"
            placeholder="Username"
            formData={formData.username}
            handleInputChange={(value) => handleInputChange('username', value)}
            isLoading={isLoading}
          />
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
          <Input
            type="password"
            icon="lock-closed-outline"
            placeholder="Confirm Password"
            formData={formData.confirmPassword}
            handleInputChange={(value) => handleInputChange('confirmPassword', value)}
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
            onPress={signupHandler}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.lg }}
            onPress={() => router.replace('/auth/LoginScreen')}
            disabled={isLoading}
          >
            <Text style={[typography.caption,globalStyles.textCenter, { color: colors.primary }]}>Already have an account? Login.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;
