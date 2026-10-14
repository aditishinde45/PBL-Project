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
        elder: {
          navy: '#0F172A',
          primary: '#1E40AF',
          primaryLight: '#3B82F6',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          subtext: '#475569',
          border: '#E2E8F0',
          success: '#059669',
          successLight: '#D1FAE5',
          warning: '#D97706',
          warningLight: '#FEF3C7',
          danger: '#DC2626',
          dangerLight: '#FEE2E2',
          accent: '#4F46E5',
          accentLight: '#EEF2FF'
        }
      },
      fontSize: {
        'senior-base': '1.125rem',   // 18px min body
        'senior-lg': '1.25rem',     // 20px
        'senior-xl': '1.5rem',      // 24px
        'senior-2xl': '1.875rem',   // 30px
        'senior-3xl': '2.25rem',    // 36px
        'senior-4xl': '3rem',       // 48px
      },
      minHeight: {
        'touch': '56px',
        'touch-lg': '68px'
      }
    },
  },
  plugins: [],
}
