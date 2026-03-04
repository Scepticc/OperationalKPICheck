import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        navy: {
          50:  '#eef2ff',
          100: '#dde6fd',
          200: '#c3d0fb',
          300: '#93aaf5',
          400: '#6380ed',
          500: '#3d55e3',
          600: '#2a3ad9',
          700: '#1e2fc6',
          800: '#1a2553',
          900: '#0f1a3e',
          950: '#090f24',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(132,204,22,0.2), 0 0 20px rgba(132,204,22,0.05)' },
          '100%': { boxShadow: '0 0 10px rgba(132,204,22,0.4), 0 0 40px rgba(132,204,22,0.1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
