import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { AuthContext } from "../../store/auth-context";
import { useRouter } from "expo-router";
import { registerUser, validateRegistrationData } from "../../utils/authService";
import Input from "../../components/ui/Input";
import { colors, typography, spacing, globalStyles } from "../../constants/globalStyles";
import { wp, hp } from "../../utils/helpers";

const dark = colors.dark;

function SignupScreen() {
  const [formData, setFormData] = useState({ userName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidation = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const validation = validateRegistrationData(formData);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      setError(errorMessage);
      return false;
    }
    setError('');
    return true;
  };

  async function signupHandler() {
    setError('');
    if (!handleValidation()) return;
    
    setIsLoading(true);
    setIsAuthenticating(true);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        // Show success message
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully. You can now login.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/LoginScreen')
            }
          ]
        );
      } else {
        setError(result.message || 'Registration failed');
        
        // Show specific error messages for different error types
        if (result.error?.status === 409) {
          if (result.error.message.includes('Username')) {
            setError('Username already exists. Please choose a different username.');
          } else {
            setError('Email or username already exists. Please use a different email or login.');
          }
        } else if (result.error?.status === 400) {
          setError('Please check your input and try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
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
        <View style={{ width:wp('100%'), padding: spacing.lg, backgroundColor: dark.background }}>
          <Text style={[typography.h2, globalStyles.textCenter, { marginBottom: spacing.xl, color: dark.text }]}>Sign Up for Tiktok</Text>
          <Text style={[typography.caption, globalStyles.textCenter, { marginBottom: spacing.xl, color: dark.subtext }]}>Create an account to follow creators, like videos, comment, and more.</Text>
          <Input
            type="text"
            icon="person-outline"
            placeholder="Username"
            formData={formData.userName}
            handleInputChange={(value) => handleInputChange('userName', value)}
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
              { backgroundColor: dark.primary },
              isLoading && globalStyles.buttonDisabled,
              { marginTop: spacing.xl }
            ]}
            onPress={signupHandler}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={dark.text} />
            ) : (
              <Text style={[globalStyles.buttonText, {color: dark.text}]}>Sign Up</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: spacing.lg }}
            onPress={() => router.replace('/auth/LoginScreen')}
            disabled={isLoading}
          >
            <Text style={[typography.caption,globalStyles.textCenter, { color: dark.primary }]}>Already have an account? Login.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;
