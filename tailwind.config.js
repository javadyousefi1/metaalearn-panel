/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#4B26AD',
          600: '#3d1f8f',
          700: '#311974',
          800: '#25135a',
          900: '#1a0e41',
          950: '#0f0828',
        },
      },
    },
  },
  plugins: [],
  // Ant Design uses important internally, so we need to add important to tailwind
  corePlugins: {
    preflight: true,
  },
}
