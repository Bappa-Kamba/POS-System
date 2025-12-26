import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['pos-server.local'],
  },
  build: {
    outDir: '../pos/client',
    emptyOutDir: true,
  },
})
