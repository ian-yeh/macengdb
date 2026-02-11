/** @type {import('tailwindcss').Config} */
export default {
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
        'maceng-maroon': '#7A2518',
        'maceng-orange': '#C25E1B',
      },
    },
  },
  plugins: [],
}
