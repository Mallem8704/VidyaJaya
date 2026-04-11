/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540',
          light: '#1E3A5F',
        },
        secondary: {
          DEFAULT: '#FF6B00',
          light: '#FF8C3A',
        },
        accent: {
          green: '#00C853',
          gold: '#FFD700',
          purple: '#7C3AED',
        },
        bg: {
          light: '#F8FAFC',
          card: '#FFFFFF',
        },
        text: {
          primary: '#0A2540',
          secondary: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        dark: {
          bg: '#0B1120',
          card: '#111827',
          text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
          },
          border: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 24px rgba(10,37,64,0.10)',
      },
      borderRadius: {
        'custom': '16px',
      }
    },
  },
  plugins: [],
}
