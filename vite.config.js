import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: '/',
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
});
