import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost', // or true to listen on network
    watch: {
      usePolling: true, // useful if you're on WSL or Docker
    },
  },
})
