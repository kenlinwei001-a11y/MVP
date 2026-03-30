/**
 * Apple Design System - Strict 3-Color Palette
 *
 * 每页不超过3个核心颜色：
 * 1. Background (White/Light Gray)
 * 2. Accent (Apple Blue)
 * 3. Text (Black/Dark Gray)
 */

// Core Palette - Only 3 colors
export const AppleColors = {
  // 1. Background Scale (Monochromatic)
  background: {
    primary: '#FFFFFF',      // Main background
    secondary: '#F5F5F7',    // Secondary background
    tertiary: '#E8E8ED',     // Borders/Dividers
  },

  // 2. Accent Color (Single blue)
  accent: {
    primary: '#007AFF',      // Apple Blue
    light: 'rgba(0, 122, 255, 0.15)',  // Hover/Selected bg
    dark: '#0051D5',         // Pressed state
  },

  // 3. Text Scale (Monochromatic)
  text: {
    primary: '#1D1D1F',      // Main text
    secondary: '#6E6E73',    // Secondary text
    tertiary: '#86868B',     // Placeholder/Disabled
  },
} as const;

// Semantic aliases for clarity
export const {
  background: bg,
  accent,
  text
} = AppleColors;

// Common style combinations
export const AppleStyles = {
  // Cards/Panels
  card: {
    backgroundColor: AppleColors.background.primary,
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },

  // Interactive elements
  button: {
    primary: {
      backgroundColor: AppleColors.accent.primary,
      color: '#FFFFFF',
      borderRadius: '8px',
    },
    secondary: {
      backgroundColor: AppleColors.background.secondary,
      color: AppleColors.text.primary,
      borderRadius: '8px',
    },
  },

  // Text styles
  heading: {
    color: AppleColors.text.primary,
    fontWeight: 600,
  },
  body: {
    color: AppleColors.text.primary,
  },
  caption: {
    color: AppleColors.text.secondary,
  },
} as const;
