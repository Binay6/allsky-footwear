// Vite is the tool that runs our React app while we develop.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Any request starting with /api is forwarded to our Express server.
    // This means the React code can simply call fetch('/api/products').
    proxy: { '/api': 'http://localhost:5000' },
  },
});
