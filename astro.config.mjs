// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://airsonde.com',
  output: 'static',
  // visual-sample is the branch-only internal sample page: noindex, and it
  // must also stay out of the sitemap or the N==N dist gate breaks.
  integrations: [sitemap({ filter: (page) => !page.includes('/visual-sample/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
