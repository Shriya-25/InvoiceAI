/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          tint: '#EFF4FF',
        },
        sidebar: {
          DEFAULT: '#0F1115',
          active: '#1C2027',
        },
        surface: '#F7F9FC',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        border: '#E5E7EB',
        'text-primary': '#0F1115',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        dropdown: '0 4px 16px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
