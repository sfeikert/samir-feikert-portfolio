/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#000000',
          muted: '#616161',
          tint: '#F5F5F5',
        },
      },
      fontFamily: {
        display: [
          '"Univers"',
          '"Inter"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        sans: [
          '"Untitled Sans"',
          '"Albert Sans"',
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
