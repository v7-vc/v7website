import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import optimizeImages from './src/integrations/optimize-images.mjs';

// https://astro.build/config
export default defineConfig({
  // The ONLY place the site's domain lives — canonical URLs, og:url and the
  // sitemap all derive from it. Going live on the real domain = change this
  // line (plus adding the domain in Vercel).
  site: 'https://v7.vc',
  integrations: [sitemap(), optimizeImages()],
  // Warm every internal link on hover/touch, so by the time the 0.55s exit
  // animation finishes the next page is already in cache and swaps instantly
  // instead of starting its download only after the animation.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  server: { host: true, port: 4321 },
});
