/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000666',
          light: '#1a237e',
          dark: '#00044a',
        },
        secondary: {
          DEFAULT: '#005faf',
          light: '#1a7fc1',
          dark: '#004080',
        },
        accent: '#8690ee',
        surface: {
          DEFAULT: '#f9f9f9',
          low: '#f3f3f3',
          high: '#e8e8e8',
          highest: '#e2e2e2',
        },
        brand: {
          navy: '#000666',
          blue: '#005faf',
          indigo: '#1a237e',
          lavender: '#bdc2ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'login-gradient': 'linear-gradient(135deg, #000666 0%, #1a237e 50%, #005faf 100%)',
        'card-gradient': 'linear-gradient(135deg, #000666 0%, #005faf 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #000666 0%, #1a237e 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 6, 102, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 6, 102, 0.16)',
        sidebar: '4px 0 24px rgba(0, 6, 102, 0.2)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(-100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
