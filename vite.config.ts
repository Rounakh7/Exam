import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0) so other devices can open the site using this PC's IP
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
