import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Public reading site. In dev, /api and /uploads proxy to the local backend.
// In production, set VITE_API_BASE_URL to the backend URL (cross-origin).
//
// BASE_PATH = the sub-path the site is served under. GitHub Pages project sites
// live at /<repo>/ (set BASE_PATH=/greenoccasion-web/ in the deploy workflow).
// For a root domain (custom domain / Cloudflare Pages) leave it as '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: process.env.DEV_API_TARGET || 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: process.env.DEV_API_TARGET || 'http://localhost:3001', changeOrigin: true },
    },
  },
});
