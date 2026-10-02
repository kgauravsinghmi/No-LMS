/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        },
        dark: {
          bg: '#0B0F19',
          surface: '#111827',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          indigo: '#6366F1',
          wash: 'rgba(99, 102, 241, 0.08)',
          'wash-hover': 'rgba(99, 102, 241, 0.12)',
        },
      },
      spacing: {
        // 8pt grid scale
        '2': '0.5rem',   // 8px
        '4': '1rem',     // 16px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        'zen': '800px',
      }
    },
  },
  plugins: [],
}
