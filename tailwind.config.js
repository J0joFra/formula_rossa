/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ferrari: {
          red: '#DC0000',
          yellow: '#FFD700',
        }
      },
    },
  },
  plugins: [],
}