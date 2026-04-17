/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look inside the app and src folders for your classes
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F8CB2E",
        secondary: "#E6B800",
        background: "#1A1A1A",
        surface: "#FFFFFF",
        success: "#34C759",
        destructive: "#FF3B30"
      }
    },
  },
  plugins: [],
}