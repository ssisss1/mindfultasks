import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.VITE_API_TARGET ?? 'http://localhost:8787'

// https://vite.dev/config/
export default defineConfig({
  // App is served from the site root (the Node server hosts the built client).
  base: '/',
  plugins: [react()],
  server: {
    // Proxy the API in dev so the browser stays same-origin and cookies work.
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
})
