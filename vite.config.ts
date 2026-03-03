import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/discovery-session-tool/' : '/',
  server: {
    port: 8000,
  },
  build: {
    outDir: 'dist',
  },
});
