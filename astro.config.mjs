// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://pagosaforestlodge.com',
  outDir: './output',  // Changed from dist to avoid permission issues
  vite: {
    plugins: [tailwindcss()]
  }
});
