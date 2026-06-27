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
        background: {
          void: '#09090b',
          card: '#18181b',
          cardMuted: '#27272a',
        },
        border: {
          sleek: '#27272a',
          accent: '#3f3f46',
        },
        accent: {
          primary: '#6366f1', // Indigo core
          secondary: '#ec4899', // Pink details
          success: '#22c55e', // Success Green
          xp: '#eab308', // Gold
          streak: '#f97316', // Fire orange
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
        'glass-border': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'success-glow': '0 8px 32px 0 rgba(34, 197, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
