/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#f2b415',
          'gold-dark': '#d4990f',
          'gold-light': '#fef9e7',
          'gold-muted': '#fef3c7',
          teal: '#257d75',
          'teal-dark': '#1d6560',
          'teal-darker': '#145550',
          'teal-light': '#e8f5f4',
          'teal-muted': '#d1ece9',
          'sidebar': '#0a2c2a',
          'sidebar-dark': '#071e1d',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #f2b415, #257d75)',
        'teal-gradient': 'linear-gradient(135deg, #257d75, #1d6560)',
        'gold-gradient': 'linear-gradient(135deg, #f2b415, #d4990f)',
        'sidebar-gradient': 'linear-gradient(180deg, #0a2c2a, #071e1d)',
      }
    },
  },
  plugins: [],
}
