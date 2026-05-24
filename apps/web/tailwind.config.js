/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sui: '#4DA2FF',
        walrus: '#00C2FF',
        seal: '#7E57C2',
      },
    },
  },
  plugins: [],
};
