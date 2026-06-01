import headlessui from '@headlessui/tailwindcss';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
// OpenSight — sistema visual "Warmind Carmesim".
// Fonte da verdade da paleta: ../Branding/PaletaDeCores.md
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', '"Saira"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // ===== Paleta Warmind =====
        void: '#0A0B0D',
        obsidian: '#121419',
        gunmetal: '#1C1F26',
        graphite: '#2C3038',
        steel: '#4B515C',
        ash: '#8C929C',
        bone: '#E8E4DB',
        crimson: { DEFAULT: '#C1121F', deep: '#8A0B16', blood: '#6A040F' },
        ember: { DEFAULT: '#F03A24', glow: '#FF4D3D' },
        brass: { DEFAULT: '#C8962C', bright: '#E8B23E' },
        gain: { DEFAULT: '#2FA572', soft: '#1E5C44' },
        loss: { DEFAULT: '#E5484D', soft: '#5C1F24' },
        warning: '#E8A317',
        info: '#5A92B0',

        // ===== Tokens do Tremor (sintonizados ao tema escuro Warmind) =====
        tremor: {
          brand: { faint: '#1A0608', muted: '#6A040F', subtle: '#8A0B16', DEFAULT: '#C1121F', emphasis: '#F03A24', inverted: '#0A0B0D' },
          background: { muted: '#0A0B0D', subtle: '#121419', DEFAULT: '#1C1F26', emphasis: '#E8E4DB' },
          border: { DEFAULT: '#2C3038' },
          ring: { DEFAULT: '#2C3038' },
          content: { subtle: '#4B515C', DEFAULT: '#8C929C', emphasis: '#E8E4DB', strong: '#E8E4DB', inverted: '#0A0B0D' },
        },
        'dark-tremor': {
          brand: { faint: '#1A0608', muted: '#6A040F', subtle: '#8A0B16', DEFAULT: '#C1121F', emphasis: '#F03A24', inverted: '#0A0B0D' },
          background: { muted: '#0A0B0D', subtle: '#121419', DEFAULT: '#1C1F26', emphasis: '#E8E4DB' },
          border: { DEFAULT: '#2C3038' },
          ring: { DEFAULT: '#2C3038' },
          content: { subtle: '#4B515C', DEFAULT: '#8C929C', emphasis: '#E8E4DB', strong: '#E8E4DB', inverted: '#0A0B0D' },
        },
      },
      boxShadow: {
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        'tremor-card': '0 1px 0 rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.45)',
        'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        'dark-tremor-card': '0 1px 0 rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.45)',
        'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
        'reactor': '0 0 12px rgba(240,58,36,0.55), 0 0 28px rgba(255,77,61,0.35)',
      },
      borderRadius: {
        'tremor-small': '0.25rem',
        'tremor-default': '0.375rem',
        'tremor-full': '9999px',
      },
      fontSize: {
        'tremor-label': ['0.7rem', { letterSpacing: '0.08em' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|text|border|ring|stroke|fill)-(emerald|red|amber|rose|blue|gray)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'ui-selected', 'dark'],
    },
    {
      pattern: /^(bg|text|border|ring|stroke|fill)-(gain|loss|ember|crimson|brass|info|warning)$/,
    },
  ],
  plugins: [headlessui, forms],
};
