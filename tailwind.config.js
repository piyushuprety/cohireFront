/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        bounceRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(10px)' },
          '30%': { transform: 'translateX(0)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        bounceRight: 'bounceRight 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        Montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
    },
  },
  plugins: [],
}; 