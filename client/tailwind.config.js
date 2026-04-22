/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Forces Tailwind compiler reload over Vite bounds explicitly
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A66C2",
        secondary: "#E8F3FF",
      }
    },
  },
  plugins: [],
};
