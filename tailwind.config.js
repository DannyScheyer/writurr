/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Fanwood Text', 'serif'],
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'source-code-pro', 'Menlo', 'Courier New', 'monospace'],
      },
      colors: {
        gray: {
          950: '#0a0a0a',
        }
      }
    },
  },
  plugins: [],
} 