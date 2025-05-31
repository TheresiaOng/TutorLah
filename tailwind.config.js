/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryOrange: '#FFAF2F',
        darkPrimaryOrange: '#E9901B',
        secondaryOrange: '#FFD256',
        paleOrange: '#FFEFC3',
        darkBrown: '#8B402E',
        primaryBlue: '#2C69A2',
        darkPrimaryBlue: '#14317A',
        secondaryBlue: '#59AEFF',
        paleBlue: '#D8ECFF',
        darkGray: '#5d5d5d',
        gray: '#8e8e93',
        lightGray: '#ebebeb'
      },
      fontFamily: {
        "asap-regular": ["Asap-Regular"],
        "asap-medium": ["Asap-Medium"],
        "asap-semibold": ["Asap-SemiBold"],
        "asap-bold": ["Asap-Bold"],
        "luckiest-guy": ["LuckiestGuy"]
      }
    },
  },
  plugins: [],
}