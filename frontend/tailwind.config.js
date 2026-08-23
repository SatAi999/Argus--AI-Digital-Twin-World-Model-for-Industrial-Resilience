/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#07080a',
          900: '#0e1014',
          800: '#161920',
          700: '#212530',
          600: '#2c3240',
          500: '#434b5c',
          400: '#647087',
          300: '#94a1b8',
          100: '#e2e8f0',
        },
        alarm: {
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#10b981',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
