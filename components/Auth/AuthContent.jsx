import React from 'react';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';
import OtpForm from './OtpForm.jsx';
import ForgotPasswordForm from './ForgotPasswordForm.jsx';
import { View } from 'react-native';

export default function AuthContent(props) {
  const { type, onSubmit } = props;

  const renderForm = () => {
    switch (type) {
      case 'login':
        return <LoginForm onSubmit={onSubmit} />;
      case 'register':
        return <SignupForm onSubmit={onSubmit} />;
      case 'otp':
        return <OtpForm onSubmit={onSubmit} />;
      case 'forgotPassword':
        return <ForgotPasswordForm onSubmit={onSubmit} />;
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <View>
        {renderForm()}
      </View>
    </View>
  );
}
