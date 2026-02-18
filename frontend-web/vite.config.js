import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Listen on localhost only
    port: 5173, // Default Vite port
    strictPort: false, // Allow fallback to next port if 5173 is busy
    open: false, // Don't auto-open browser
  },
})
