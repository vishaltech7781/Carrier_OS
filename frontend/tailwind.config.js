/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFDFC',
          100: '#FBFBF9',
          200: '#F5F4EE',
          300: '#ECEAE2',
          border: '#E2DFD6',
          borderDark: '#D4D0C5',
        },
        ink: {
          900: '#14181F',
          800: '#202633',
          700: '#3A4252',
          600: '#555F73',
          500: '#7E889B',
          400: '#A9B1C0',
          300: '#D2D7E0',
          100: '#F0F2F5',
        },
        forest: {
          900: '#0E241B',
          800: '#153628',
          700: '#1B4332',
          600: '#235942',
          500: '#2D6A4F',
          400: '#40916C',
          100: '#E8F5EE',
          50: '#F2F9F5',
        },
        terracotta: {
          700: '#8A2424',
          600: '#B91C1C',
          100: '#FEE2E2',
          50: '#FEF2F2',
        },
        ochre: {
          700: '#8F4608',
          600: '#D97706',
          100: '#FEF3C7',
          50: '#FFFBEB',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(20, 24, 31, 0.04)',
        card: '0 1px 3px 0 rgba(20, 24, 31, 0.05), 0 1px 2px -1px rgba(20, 24, 31, 0.05)',
      },
    },
  },
  plugins: [],
}

