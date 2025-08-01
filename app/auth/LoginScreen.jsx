import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { loginUser, validateLoginData } from "../../utils/authService";
import { useRouter } from "expo-router";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { wp, hp } from "../../utils/helpers";

const dark = colors.dark;

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
    const validation = validateLoginData(formData);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      setError(errorMessage);
      return false;
    }
    setError('');
    return true;
  };

  async function loginHandler() {
    setError('');
    if (!handleValidation()) return;
    
    setIsLoading(true);
    setIsAuthenticating(true);

    try {
      const result = await loginUser(formData);
      
      if (result.success) {
        // Update auth context with user data
        authCtx.authenticate(result.data.user);
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        setError(result.message || 'Login failed');
        
        // Show specific error messages for different error types
        if (result.error?.status === 404) {
          setError('User not found. Please check your email.');
        } else if (result.error?.status === 401) {
          setError('Invalid password. Please try again.');
        } else if (result.error?.status === 400) {
          setError('Please check your email and password format.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <Text style={{color: dark.text}}>Loading...</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: dark.background }]}> 
        <View style={{padding:spacing.lg, width:wp('100%'), backgroundColor: dark.background}}>
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl, color: dark.text }]}>Login to Tiktok</Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: dark.subtext }]}>Manage your account, check notifications, comment on videos, and more.</Text>
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
              { backgroundColor: dark.primary },
              isLoading && globalStyles.buttonDisabled,
              { marginTop: spacing.xl }
            ]}
            onPress={loginHandler}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={dark.text} />
            ) : (
              <Text style={[globalStyles.buttonText, {color: dark.text}]}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.md }}
            onPress={() => router.replace('/auth/SignupScreen')}
            disabled={isLoading}
          >
            <Text style={[globalStyles.textCenter,typography.caption ,{color:dark.primary}]}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.sm }}
            onPress={() => router.replace('/auth/ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={[globalStyles.textCenter,typography.caption, { color: dark.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
