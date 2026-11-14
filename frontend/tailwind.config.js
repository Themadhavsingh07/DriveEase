/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#101B2D',
          50: '#f4f6fa',
          100: '#e5eaf3',
          200: '#cfd8e8',
          300: '#abbdd7',
          400: '#7f9cc2',
          500: '#5f80ad',
          600: '#4a6794',
          700: '#3c5277',
          800: '#344563',
          900: '#101B2D',
          950: '#0b121e',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
          grey: '#F5F7FA',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1d4ed8',
          light: '#3b82f6',
          subtle: '#eff6ff',
        },
        slate: {
          text: '#1E293B',
          muted: '#64748B',
          subtle: '#94A3B8',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(16, 27, 45, 0.06), 0 2px 6px -1px rgba(16, 27, 45, 0.04)',
        'card-hover': '0 20px 30px -10px rgba(16, 27, 45, 0.12), 0 8px 12px -4px rgba(16, 27, 45, 0.06)',
        'elevated': '0 25px 50px -12px rgba(16, 27, 45, 0.18)',
        'accent-glow': '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
