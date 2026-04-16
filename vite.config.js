import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the repository name for GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoName = isGitHubPages ? '/Sistemas-Controle-Custos' : '/';

export default defineConfig({
  plugins: [react()],
  base: repoName,
})