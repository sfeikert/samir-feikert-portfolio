import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Tailwind CSS v3 is wired through PostCSS (see postcss.config.mjs).
export default defineConfig({
  site: 'https://samirfeikert.com',
  integrations: [react()],
});
