/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure these paths are correct for your project
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#1E3A8A',
        'custom-green': '#10B981',
        
      },
      fontFamily: {
        'custom-font': ['Roboto', 'Arial', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
