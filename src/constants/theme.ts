export const COLORS = {
  primary: '#065F46',
  primaryMid: '#059669',
  primaryAccent: '#10B981',
  primaryLight: '#A7F3D0',
  primarySurface: '#D1FAE5',
  background: '#ECFDF5',

  tealDeep: '#0D4D4D',
  teal: '#0D9488',
  tealLight: '#CCFBF1',

  warningDeep: '#854D0E',
  warning: '#CA8A04',
  warningBg: '#FEF9C3',

  dangerDeep: '#7C2D12',
  danger: '#C2410C',
  dangerBg: '#FFEDD5',

  incomeDeep: '#164E63',
  income: '#0E7490',
  incomeBg: '#CFFAFE',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#F9FAFB',
  border: '#E5E7EB',
} as const;

export const RADIUS = {
  input: 8,
  button: 12,
  card: 16,
  tag: 24,
  full: 9999,
} as const;

export const FONT = {
  family: 'Inter',
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
  },
} as const;
