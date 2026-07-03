/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/frontend/html.js', './src/frontend/app.js'],
  safelist: [
    'bg-blue-500/10',
    'bg-purple-500/10',
    'bg-emerald-500/10',
    'bg-amber-500/10',
    'bg-red-500/10',
    'bg-red-500/15',
    'bg-accent',
    'bg-accent/10',
    'bg-accent/20',
    'text-blue-400',
    'text-purple-400',
    'text-emerald-400',
    'text-amber-400',
    'text-accent-light',
    'text-emerald-300',
    'text-red-300',
    'border-accent/20',
    'border-accent/30',
    'border-accent/40',
    'border-emerald-500/30',
    'border-red-500/20',
    'border-red-500/30',
    'hover:border-accent/30',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0c0c1d',
          card: '#13132b',
          hover: '#1a1a3a',
          input: '#0e0e24',
          border: '#1f1f45',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dim: '#4f46e5',
        },
        muted: {
          DEFAULT: '#64748b',
          light: '#94a3b8',
          dark: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
