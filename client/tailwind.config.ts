import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          secondary: '#10B981',
          accent: '#F59E0B'
        }
      }
    }
  },
  plugins: []
};

export default config;
