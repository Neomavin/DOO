import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          navy: '#14213d',
          accent: '#fca311',
          gray: '#e5e5e5',
          white: '#ffffff'
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      boxShadow: {
        card: '0 10px 25px rgba(20, 33, 61, 0.15)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
