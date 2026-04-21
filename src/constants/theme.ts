export const COLORS = {
  // Feature colors
  green: '#1D9E75',
  greenLight: '#E1F5EE',
  greenDark: '#085041',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  redDark: '#A32D2D',
  purple: '#534AB7',
  purpleLight: '#EEEDFE',
  purpleDark: '#3C3489',
  blue: '#378ADD',
  blueLight: '#E6F1FB',
  blueDark: '#0C447C',
  amber: '#BA7517',
  amberLight: '#FAEEDA',
  gray: '#888780',
  grayLight: '#F1EFE8',
  // Utility
  white: '#FFFFFF',
  offWhite: '#F9FAFB',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#F9FAFB',
} as const;

export const RADIUS = {
  input: 8,
  button: 12,
  card: 16,
  tag: 24,
  full: 9999,
} as const;

export const FONT = {
  sizes: {
    xs: 11,
    sm: 12,
    sm2: 13,
    md: 14,
    md2: 15,
    lg: 18,
    xl: 20,
    xxl: 26,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
} as const;
