/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f3f6f4',
          100: '#e3ece6',
          200: '#c7d9cd',
          300: '#a1bfab',
          400: '#749d84',
          500: '#548065',
          600: '#41664f',
          700: '#365241',
          800: '#2d4235',
          900: '#26372d',
        },
      },
    },
  },
  plugins: [],
}
