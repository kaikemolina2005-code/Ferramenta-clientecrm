/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'dark-blue': '#1e3a5f',
        'light-gray': '#f5f7fa',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': 'blur(10px)',
      },
      borderRadius: {
        'glass': '15px',
      },
    },
  },
  plugins: [],
}
