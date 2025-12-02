import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    // Increase chunk size warning limit slightly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React and core libraries
          'vendor-react': ['react', 'react-dom'],
          // Charting libraries (heavy)
          'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
          // Date utilities
          'vendor-date': ['date-fns'],
          // Firebase (heavy)
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Icons
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
