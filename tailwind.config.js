/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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