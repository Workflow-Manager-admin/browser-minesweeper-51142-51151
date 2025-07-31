import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.kavia.ai'],
    port: 3000,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    watch: {
      usePolling: true
    }
  }
});
