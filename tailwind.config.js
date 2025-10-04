/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
    },
    extend: {
      colors: {
        brand: {
          50: '#fff1f7',
          100: '#ffe4f0',
          200: '#fecce3',
          300: '#fda4ca',
          400: '#fb71a7',
          500: '#ff5ca3',
          600: '#e04a91',
          700: '#c73472',
          800: '#a4295c',
          900: '#88244e',
          950: '#531029',
        },
        glass: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.85)',
          200: 'rgba(255, 255, 255, 0.75)',
          300: 'rgba(255, 255, 255, 0.65)',
          400: 'rgba(255, 255, 255, 0.55)',
          500: 'rgba(255, 255, 255, 0.45)',
          600: 'rgba(255, 255, 255, 0.35)',
          700: 'rgba(255, 255, 255, 0.25)',
          800: 'rgba(255, 255, 255, 0.15)',
          900: 'rgba(255, 255, 255, 0.05)',
        }
      },
      fontFamily: {
        'sans': [
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          '"PingFang SC"', 
          '"Hiragino Sans GB"', 
          '"Microsoft YaHei"', 
          '"Helvetica Neue"', 
          'Helvetica', 
          'Arial', 
          'sans-serif'
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'glow': '0 10px 30px -10px rgba(255,92,163,0.45)',
        'glow-lg': '0 20px 60px -15px rgba(255,92,163,0.35)',
        'glow-xl': '0 30px 80px -20px rgba(255,92,163,0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.25)',
        'glass-xl': '0 24px 64px 0 rgba(31, 38, 135, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '80px',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255,92,163,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255,92,163,0.6)' },
        },
      },
      gridTemplateColumns: {
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-300': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}