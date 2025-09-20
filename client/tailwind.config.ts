import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0A84FF',
          secondary: '#34C759',
          accent: '#FF9F0A',
          surface: '#FFFFFF'
        },
        neutral: {
          50: '#F5F7FF',
          100: '#E9ECF8',
          200: '#D8DBF0',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['"SF Pro Text"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 40px -24px rgba(15, 23, 42, 0.45)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)'
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem'
      }
    }
  },
  plugins: []
};

export default config;
