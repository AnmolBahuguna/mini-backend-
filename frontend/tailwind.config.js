/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          surface: '#0e0e0f',
          low: '#131314',
          container: '#1a191b',
          high: '#201f21',
          highest: '#262627',
          text: '#ffffff',
          muted: '#adaaab',
          outline: '#484849',
          primary: '#5cbfff',
          primaryDim: '#00a7f0',
          secondary: '#9093ff',
          tertiaryDim: '#00edb4',
          error: '#ff716c',
        },
        dhip: {
          primary: '#0A0F1E',
          secondary: '#111827',
          card: '#1F2937',
          blue: '#2563EB',
          purple: '#7C3AED',
          green: '#059669',
          red: '#DC2626',
          orange: '#D97706',
        },
      },
      fontFamily: {
        headline: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(37, 99, 235, 0.5), 0 10px 30px rgba(37, 99, 235, 0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
}

