import type { Config } from 'tailwindcss';

/**
 * Cloudstaff design tokens lifted from the v1 prototype's CSS variables.
 * Replace with the exact Cloudstaff brand palette when confirmed —
 * the values below were approximated from cloudstaff.com.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          primary: '#0B5FFF',
          'primary-dark': '#003FB3',
          accent: '#00C2D7',
          ink: '#0B1B3A',
          text: '#1F2937',
          muted: '#6B7280',
          bg: '#F4F7FB',
          card: '#FFFFFF',
          border: '#E5EAF1',
          'border-strong': '#C9D2DF',
          success: '#10B981',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        cs: '0 1px 2px rgba(11,27,58,.04), 0 8px 24px rgba(11,27,58,.06)',
        'cs-lg': '0 12px 40px rgba(11,27,58,.12)',
      },
      borderRadius: {
        cs: '12px',
        'cs-sm': '8px',
      },
    },
  },
  plugins: [],
};

export default config;
