/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
          boxShadow: {
        right: '5px 0 10px 0px rgba(134, 134, 134, 0.43)', // adjust as needed
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
