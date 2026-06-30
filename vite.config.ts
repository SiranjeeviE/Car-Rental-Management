import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/cars': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
      '/bookings': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
      '/feedback': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
      '/stats': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
      '/reset': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      }
    }
  }
});
