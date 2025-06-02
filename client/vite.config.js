import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: path.resolve(__dirname, 'login.html'),
        home: path.resolve(__dirname, 'home.html'),
        signup:path.resolve(__dirname,'signup.html'),
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
