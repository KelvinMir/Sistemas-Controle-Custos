import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages repository deployment
export default defineConfig({
  plugins: [react()],
  base: '/Sistemas-Controle-Custos/',
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    cssCodeSplit: false,
  }
})