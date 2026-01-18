/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Apply "darkMode: 'class'" to enable dark mode customization
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
