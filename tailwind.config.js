/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2E8B57',
          dark: '#246F46',
          light: '#E8F5EE',
          muted: '#4CAF7A',
        },
        primary: {
          DEFAULT: '#2E8B57',
          dark: '#246F46',
          light: '#E8F5EE',
        },
        success: '#2E8B57',
        danger: '#DC2626',
        warning: '#D97706',
        info: '#0F766E',
        border: '#E5E7EB',
        surface: '#FFFFFF',
        app: {
          bg: '#F4F6F8',
          text: '#1F2933',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        float: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
