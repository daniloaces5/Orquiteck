/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orchid: {
          light: '#bc61fb',
          DEFAULT: '#a855f7',
          dark: '#9333ea',
        },
        cyan: {
          custom: '#00f2ff',
        },
        dark: {
          bg: '#050508',
          surface: '#12121a',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
