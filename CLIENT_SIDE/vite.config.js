import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/*
export default defineConfig({
  plugins: [react()],
  base: '/static/', // tells React where assets will be served from
})
*/


// CLIENT_SIDE/vite.config.js
export default defineConfig({
  build: {
    outDir: '../SERVER_SIDE/static/frontend',
    assetsDir: 'assets',  // Explicit assets directory
    manifest: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
})