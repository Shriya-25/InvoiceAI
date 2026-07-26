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
          DEFAULT: '#1A998F',
          hover: '#187F87',
          tint: '#E6F4F3',
        },
        sidebar: {
          DEFAULT: '#102E3C',
          active: '#155665',
        },
        surface: '#F4F7F6',
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
