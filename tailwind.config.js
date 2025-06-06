/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired color palette
        notion: {
          // Foundation palette (90% of design decisions)
          white: '#FFFFFF',
          'page-bg': '#FAFAFA',
          'sidebar-bg': '#F7F7F5',
          'block-bg': '#F6F6F6',
          'hover-bg': '#F1F1EF',
          border: '#E8E8E8',
          divider: '#EBEBEB',
          
          // Typography hierarchy
          'text-primary': '#1F1F1F',
          'text-secondary': '#787774',
          'text-tertiary': '#9B9A97',
          'text-placeholder': '#C7C7C5',
          
          // Strategic colors (10% of design decisions)
          blue: '#2383E2',
          green: '#0F7B6C',
          red: '#E03E3E',
          yellow: '#FFDC00',
          purple: '#9065B0',
          orange: '#D9730D',
        },
      },
      spacing: {
        // Notion spacing system
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
        'xxxl': '32px',
      },
      fontSize: {
        // Notion typography scale
        'page-title': ['32px', { lineHeight: '1.2', fontWeight: '800' }],
        'section-header': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'subsection-title': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'block-title': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-text': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-text': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'metadata': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'SFMono-Regular',
          'Consolas',
          'Liberation Mono',
          'Menlo',
          'monospace',
        ],
      },
      maxWidth: {
        'notion-page': '720px',
      },
      width: {
        'notion-sidebar': '240px',
      },
      borderRadius: {
        'notion': '6px',
        'notion-sm': '4px',
      },
    },
  },
  plugins: [],
} 