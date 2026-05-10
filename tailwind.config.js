/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F8CB2E',
          foreground: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#E6B800',
          foreground: '#1A1A1A',
        },
        background: '#1A1A1A',
        foreground: '#FAFAFA',
        surface: '#FFFFFF',
        success: {
          DEFAULT: '#34C759',
          foreground: '#FFFFFF',
        },
        input: '#333333',
        destructive: {
          DEFAULT: '#FF3B30',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#E6B800',
          foreground: '#1A1A1A',
        },
        card: {
          DEFAULT: '#262626',
          foreground: '#FAFAFA',
        },
        border: '#404040',
        muted: {
          DEFAULT: '#262626',
          foreground: '#A3A3A3',
        },
      },
      fontFamily: {
        heading: [
          'ui-sans-serif',
          'system-ui',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        'mono-financial': ['SpaceMono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
