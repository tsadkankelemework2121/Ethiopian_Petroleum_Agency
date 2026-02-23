import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          strong: 'rgb(var(--primary-strong) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.06)',
        card: '0 4px 20px rgba(2, 6, 23, 0.08)',
        elevated: '0 24px 60px rgba(2, 6, 23, 0.12)',
        glow: '0 0 40px rgba(34, 211, 238, 0.15)',
      },
      borderRadius: {
        xl: '1rem',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

