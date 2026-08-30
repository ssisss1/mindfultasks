import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://ssisss1.github.io/mindfultasks/ on GitHub Pages.
  base: '/mindfultasks/',
  plugins: [react()],
})
