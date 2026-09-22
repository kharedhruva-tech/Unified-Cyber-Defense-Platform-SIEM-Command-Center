/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#0B0F17",
          card: "#121824",
          border: "#1E293B",
          hover: "#1B2436",
          accent: "#0284C7",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          purple: "#A855F7"
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
