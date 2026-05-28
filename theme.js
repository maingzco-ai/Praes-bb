import { Platform } from 'react-native';

export const palette = {
  light: {
    background: '#F2F2F7',
    backgroundAlt: '#E8E8EE',
    card: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#3A3A3C',
    subtle: '#8E8E93',
    primary: '#34C759',
    primaryLight: '#E8F8ED',
    danger: '#FF3B30',
    dangerLight: '#FFEBEE',
    accent: '#007AFF',
    accentLight: '#E3F0FF',
    warning: '#FF9500',
    warningLight: '#FFF3E0',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    inputBg: 'rgba(0,0,0,0.02)',
    gradientStart: '#34C759',
    gradientEnd: '#28A745',
    overlay: 'rgba(0,0,0,0.4)',
    shadow: '#000',
  },
  dark: {
    background: '#1C1C1E',
    backgroundAlt: '#222224',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#D1D1D6',
    subtle: '#8E8E93',
    primary: '#34C759',
    primaryLight: '#1A3A22',
    danger: '#FF453A',
    dangerLight: '#3A1A1A',
    accent: '#0A84FF',
    accentLight: '#1A2A3A',
    warning: '#FF9F0A',
    warningLight: '#3A2A1A',
    border: '#3A3A3C',
    borderLight: '#2A2A2C',
    inputBg: 'rgba(255,255,255,0.03)',
    gradientStart: '#28A745',
    gradientEnd: '#1E7E34',
    overlay: 'rgba(0,0,0,0.6)',
    shadow: '#000',
  },
};

export const getTheme = (isDark) => (isDark ? palette.dark : palette.light);

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const sharedStyles = {
  card: {
    padding: 18,
    borderRadius: borderRadius.lg,
    marginBottom: 16,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
  },
  buttonBase: {
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
};
