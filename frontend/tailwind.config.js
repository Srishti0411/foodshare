/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#E9E2D0',
        ticket: '#FBF8F1',
        ink: '#2A251E',
        evergreen: {
          DEFAULT: '#1F3A2E',
          light: '#2F5240',
          dark: '#152A21',
        },
        tomato: {
          DEFAULT: '#C1432E',
          light: '#D96A52',
          dark: '#9A3222',
        },
        mustard: {
          DEFAULT: '#C99A1E',
          light: '#E0B44A',
        },
        line: '#CBBFA0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        ticket: '0 1px 0 rgba(42,37,30,0.06), 0 8px 20px -12px rgba(42,37,30,0.35)',
        stamp: '0 2px 6px rgba(42,37,30,0.15)',
      },
    },
  },
  plugins: [],
};
