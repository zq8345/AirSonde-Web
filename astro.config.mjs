// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://airsonde.com',
  output: 'static',
  // hero-candidates is the branch-only internal picker page: noindex, and it
  // must also stay out of the sitemap or the 25==25 dist gate breaks.
  integrations: [sitemap({ filter: (page) => !page.includes('/hero-candidates/') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
