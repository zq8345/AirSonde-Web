// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://airsonde.com',
  output: 'static',
  integrations: [
    sitemap({
      // /guides/ is a noindexed shell until W5 lands articles; the sitemap
      // must not advertise it (check-dist asserts sitemap == indexable pages).
      filter: (page) => !page.includes('/guides/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
