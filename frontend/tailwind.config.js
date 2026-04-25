module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#FFF8ED', 100:'#FAEEDA', 500:'#EF9F27', 600:'#BA7517', 700:'#8B5510' },
        coral: { 100:'#FAECE7', 500:'#D85A30', 600:'#993C1D' },
        forest:{ 100:'#EAF3DE', 500:'#639922', 600:'#3B6D11' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite' }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
