import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdf-lib', 'pdfjs-dist', 'jspdf']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['pdf-lib'],
          'pdfjs': ['pdfjs-dist'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
