/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [forms],
}

