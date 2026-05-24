import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#163A70',
        'cobalt': '#1F4EA3',
        'petroleum': '#234A6B',
        'ivory': '#F7F5F1',
        'sand': '#DCC9A3',
        'stone': '#C8CDD4',
        'midnight': '#0D1B2A',
        'champagne': '#D6C3A5',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
