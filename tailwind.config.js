/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FFAF2F',
        darkPrimary: '#E9901B',
        secondary: '#FFD256',
        accent: '#8B402E',
        darkGray: '#5d5d5d',
        gray: '#8e8e93',
        lightGray: '#ebebeb'
      }
    },
  },
  plugins: [],
}