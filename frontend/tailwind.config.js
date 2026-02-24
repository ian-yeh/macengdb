/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        'maceng-maroon': 'rgb(var(--maceng-maroon) / <alpha-value>)',
        'maceng-orange': 'rgb(var(--maceng-orange) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
