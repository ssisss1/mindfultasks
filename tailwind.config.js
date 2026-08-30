/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"DejaVu Sans Mono"',
          'monospace',
        ],
        // Big phosphor readouts (timer, counters, headings).
        display: ['"VT323"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        // Anything still asking for font-sans stays monospace for cohesion.
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        term: {
          bg: '#080b08',
          panel: '#0b110b',
          raised: '#0f160e',
          line: '#1c4a2a',
          dim: '#3a8f57',
          green: '#4dff88',
          bright: '#8affb0',
          amber: '#ffb63d',
          text: '#b6f2c7',
          muted: '#6fae83',
          danger: '#ff5f56',
        },
      },
      boxShadow: {
        term: '0 0 0 1px rgba(77,255,136,0.06), 0 0 28px rgba(77,255,136,0.05), inset 0 0 42px rgba(0,0,0,0.55)',
        'term-glow': '0 0 12px rgba(77,255,136,0.35)',
      },
    },
  },
  plugins: [],
}
