import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  envDir: '..',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor'
            if (id.includes('framer-motion') || id.includes('react-hot-toast')) return 'ui'
            if (id.includes('@tanstack/react-query') || id.includes('@supabase/supabase-js')) return 'data'
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) return 'charts'
            if (id.includes('three') || id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'three'
          }
          return undefined
        },
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
