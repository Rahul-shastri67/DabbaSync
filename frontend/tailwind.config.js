module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF8ED',
          100: '#FAEEDA',
          200: '#FCD89A',
          300: '#FACC6B',
          400: '#F5B94A',   // ← was missing — fixes dark:hover:border-brand-400
          500: '#EF9F27',
          600: '#BA7517',
          700: '#8B5510',
          800: '#5C3710',
          900: '#3B2209',
        },
        coral: {
          100: '#FAECE7',
          500: '#D85A30',
          600: '#993C1D',
        },
        forest: {
          100: '#EAF3DE',
          500: '#639922',
          600: '#3B6D11',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in':  'fadeIn .2s ease',
        'slide-up': 'slideUp .25s ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};