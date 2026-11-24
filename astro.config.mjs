import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { loadMedienProjects } from './src/utils/loadMedien.js';

// Tailwind CSS v3 is wired through PostCSS (see postcss.config.mjs).
export default defineConfig({
  site: 'https://samirfeikert.com',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    react(),
    {
      name: 'sync-medien-folder',
      hooks: {
        'astro:config:setup': () => {
          loadMedienProjects();
        },
        'astro:server:setup': ({ server }) => {
          server.watcher.add('Medien');
          server.watcher.on('all', (_event, filePath) => {
            if (filePath.includes('Medien')) {
              loadMedienProjects();
            }
          });
        },
      },
    },
  ],
});
