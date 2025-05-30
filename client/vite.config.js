import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: path.resolve(__dirname, 'login.html'),
        home: path.resolve(__dirname, 'home.html'),
      }
    }
  }
})
