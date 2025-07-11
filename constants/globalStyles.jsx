import { StyleSheet } from 'react-native';
import { wp, hp } from '../utils/helpers';

export const colors = {
  primary: '#FE2C55', // TikTok's primary color
  secondary: '#25F4EE', // TikTok's secondary color
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    100: '#F8F8F8',
    200: '#F1F1F2',
    300: '#E3E3E4',
    400: '#8B8B8B',
    500: '#666666',
  },
  success: '#00D563',
  warning: '#FFB800',
  error: '#FF2C55',
  overlay: 'rgba(0, 0, 0, 0.5)',
  // Add dark theme palette
  dark: {
    background: '#181818',
    card: '#232323',
    text: '#FFFFFF',
    subtext: '#B0B0B0',
    border: '#333333',
    inputBg: '#232323',
    inputBorder: '#333333',
    primary: '#FE2C55',
    secondary: '#25F4EE',
    error: '#FF2C55',
    overlay: 'rgba(0,0,0,0.5)',
  },
  light: {
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    subtext: '#8B8B8B',
    border: '#E3E3E4',
    inputBg: '#FFFFFF',
    inputBorder: '#E3E3E4',
    primary: '#FE2C55',
    secondary: '#25F4EE',
    error: '#FF2C55',
    overlay: 'rgba(0,0,0,0.05)',
  },
};

// Set the global theme here ("dark" or "light")
export const theme = colors.dark;

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 18,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 50,
    width: '100%',
    backgroundColor: theme.inputBg,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.body.fontSize,
    color: theme.text,
    backgroundColor: theme.inputBg,
  },

  // Button
  button: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: theme.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.secondary,
  },
  buttonDisabled: {
    backgroundColor: theme.subtext,
  },
  buttonText: {
    color: theme.text,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: theme.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Text
  textCenter: {
    textAlign: 'center',
  },
  textError: {
    color: theme.error,
    fontSize: typography.caption.fontSize,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },

  videoItem: {
    width: wp(100),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const pauseIconStyles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  iconBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}; 