import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/share-file': 'http://localhost:8081',
      '/file': 'http://localhost:8081',
      '/download': 'http://localhost:8081',
      '/test-save': 'http://localhost:8081',
      '/test-get': 'http://localhost:8081'
    }
  }
})

