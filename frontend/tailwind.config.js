/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    'bg-red-600', 'bg-red-700', 'bg-red-900', 'text-red-300', 'text-red-400', 'border-red-400', 'border-red-500', 'border-red-500/50',
    'bg-amber-600', 'text-amber-400', 'border-amber-500', 'border-amber-500/50',
    'bg-green-600', 'text-green-400', 'border-green-500', 'border-green-500/50',
    'bg-teal-600', 'text-teal-400', 'border-teal-500', 'border-teal-500/50',
    'bg-blue-600', 'border-blue-500',
  ],
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
        primary: '#0A0F1E',
        card: '#1F2937',
        input: '#111827',
        'accent-blue': '#2563EB',
        'accent-purple': '#7C3AED',
        'accent-green': '#059669',
        'accent-red': '#DC2626',
        'accent-amber': '#D97706',
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
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'count-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'count-up': 'count-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

