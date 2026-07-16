/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FB7299',
          blue: '#00A1D6',
          dark: '#18191C',
          darker: '#0F0F11',
        },
      },
    },
  },
  plugins: [],
};
