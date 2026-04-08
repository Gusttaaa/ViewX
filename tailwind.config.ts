import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        '#09090B',
        surface:   '#111115',
        surface2:  '#18181F',
        border:    '#222229',
        borderBright: '#33333D',
        accent:    '#CAFF00',
        accentDim: 'rgba(202,255,0,0.10)',
        textBase:  '#F4F4F0',
        muted:     '#6B6B78',
        dim:       '#3A3A45',
        fb:        '#1877F2',
        danger:    '#FF4757',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-outfit)', 'sans-serif'],
        mono:    ['var(--font-space-mono)', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(202,255,0,0)' },
          '50%':      { boxShadow: '0 0 24px 4px rgba(202,255,0,0.15)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.45s ease forwards',
        shimmer:      'shimmer 1.8s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
