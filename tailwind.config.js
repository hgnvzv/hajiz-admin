/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#EFF6FF',
        },
        success: '#059669',
        danger: '#DC2626',
        warning: '#F59E0B',
        border: '#E2E8F0',
        surface: '#FFFFFF',
        app: {
          bg: '#F8FAFC',
          text: '#0F172A',
          muted: '#64748B',
        },
        gold: {
          50: '#fffbf0',
          100: '#fef5dd',
          200: '#fde68a',
          300: '#fdd835',
          400: '#fcc419',
          500: '#f2b415',
          600: '#d4990f',
          700: '#a87c0a',
          800: '#856608',
          900: '#6d5306',
        },
        teal: {
          50: '#f0faf8',
          100: '#d1ece9',
          200: '#a8e6d8',
          300: '#7edcc9',
          400: '#5db5ad',
          500: '#257d75',
          600: '#1d6560',
          700: '#165550',
          800: '#145550',
          900: '#0d3a37',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'teal-sm': '0 1px 2px rgba(37, 125, 117, 0.05)',
        'teal-md': '0 4px 6px rgba(37, 125, 117, 0.1)',
        'teal-lg': '0 10px 15px rgba(37, 125, 117, 0.15)',
        'teal-xl': '0 20px 25px rgba(37, 125, 117, 0.2)',
      },
      backgroundImage: {
        'gradient-teal': 'linear-gradient(135deg, #257d75, #1d6560)',
        'gradient-gold': 'linear-gradient(135deg, #f2b415, #d4990f)',
        'gradient-mixed': 'linear-gradient(135deg, #257d75, #f2b415)',
      },
    },
  },
  plugins: [],
}
