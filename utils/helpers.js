import { Dimensions, PixelRatio } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const parsePercent = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const wp = (widthPercent) =>
  PixelRatio.roundToNearestPixel((screenWidth * parsePercent(widthPercent)) / 100);

const hp = (heightPercent) =>
  PixelRatio.roundToNearestPixel((screenHeight * parsePercent(heightPercent)) / 100);

const validateForm = (formData) => {
  if (formData.email !== undefined && !formData.email.trim()) {
    return 'Email is required';
  }
  if (formData.email !== undefined && !formData.email.includes('@')) {
    return 'Please enter a valid email';
  }
  if (formData.username !== undefined && !formData.username.trim()) {
    return 'Username is required';
  }
  if (formData.password !== undefined && formData.password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export { wp, hp, validateForm };
