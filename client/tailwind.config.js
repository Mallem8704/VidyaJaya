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
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
        },
        accent: {
          green: 'var(--accent-green)',
          gold: 'var(--accent-gold)',
          purple: 'var(--accent-purple)',
        },
        bg: {
          light: 'var(--bg-light)',
          card: 'var(--bg-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          DEFAULT: 'var(--border)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 24px rgba(10,37,64,0.10)',
        'glow-blue': '0 0 20px rgba(0,212,255,0.3)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.3)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        'custom': '16px',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(168,85,247,0.2)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      }
    },
  },
  plugins: [],
}
