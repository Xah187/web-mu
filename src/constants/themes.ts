export const lightTheme = {
  // Primary Colors
  primary: '#2117fb',
  primaryLight: '#4338ca',
  primaryDark: '#1e1b8b',
  
  // Background Colors
  background: '#f6f8fe',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Border Colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Semantic Colors
  blue: '#2117fb',
  green: '#10B982',
  red: '#FF0F0F',
  orange: '#FFB82F',
  yellow: '#ffc900',
  
  // Special Colors
  home: '#f6f8fe',
  current: '#173042',
  blueDark: '#235697',
  
  // Card & Component Colors
  cardBackground: '#ffffff',
  cardBorder: '#e5e7eb',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Navigation Colors
  navBackground: '#ffffff',
  navBorder: '#e5e7eb',
  navText: '#6b7280',
  navTextActive: '#2117fb',
  
  // Input Colors
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  inputText: '#212121',
  inputPlaceholder: '#9ca3af',
} as const;

export const darkTheme = {
  // Primary Colors - ألوان أجمل وأكثر حيوية
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Background Colors - تدرج أجمل وأكثر دفئاً
  background: '#0c1222',
  surface: '#1a1f36',
  surfaceSecondary: '#252b47',

  // Text Colors - تباين أفضل وأكثر وضوحاً
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',

  // Border Colors - حدود أكثر وضوحاً
  border: '#2d3748',
  borderLight: '#4a5568',
  borderDark: '#1a202c',

  // Status Colors - ألوان أكثر حيوية
  success: '#10b981',
  warning: '#f59e0b',
  error: '#f87171',
  info: '#60a5fa',

  // Semantic Colors
  blue: '#6366f1',
  green: '#10b981',
  red: '#f87171',
  orange: '#fb923c',
  yellow: '#fbbf24',

  // Special Colors
  home: '#0c1222',
  current: '#1a1f36',
  blueDark: '#3730a3',

  // Card & Component Colors - ألوان أكثر تباينً وجمالاً
  cardBackground: '#1a1f36',
  cardBorder: '#2d3748',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  // Navigation Colors
  navBackground: '#1a1f36',
  navBorder: '#2d3748',
  navText: '#cbd5e1',
  navTextActive: '#6366f1',

  // Input Colors
  inputBackground: '#252b47',
  inputBorder: '#4a5568',
  inputText: '#f1f5f9',
  inputPlaceholder: '#94a3b8',
} as const;

export type Theme = typeof lightTheme;
export type ThemeKey = keyof Theme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeMode = keyof typeof themes;
