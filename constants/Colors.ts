export const BrandColors = {
  primaryYellow: '#F8CB2E',
  deepYellow: '#E6B800',
  darkBg: '#1A1A1A',
  surfaceWhite: '#FFFFFF',
  surfaceLight: '#F5F5F0',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  successGreen: '#34C759',
  dangerRed: '#FF3B30',
  warningOrange: '#FF9500',
  borderLight: '#E5E5EA',
  shadow: 'rgba(0,0,0,0.08)',
} as const;

export default {
  light: {
    text: BrandColors.textPrimary,
    background: BrandColors.surfaceLight,
    tint: BrandColors.primaryYellow,
    tabIconDefault: BrandColors.textSecondary,
    tabIconSelected: BrandColors.textPrimary,
    card: BrandColors.surfaceWhite,
    border: BrandColors.borderLight,
  },
  dark: {
    text: BrandColors.surfaceWhite,
    background: BrandColors.darkBg,
    tint: BrandColors.primaryYellow,
    tabIconDefault: '#8E8E93',
    tabIconSelected: BrandColors.primaryYellow,
    card: '#262626',
    border: '#3A3A3C',
  },
};
