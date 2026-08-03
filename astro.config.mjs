import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The ONLY place the site's domain lives — canonical URLs, og:url and the
  // sitemap all derive from it. Going live on the real domain = change this
  // line (plus adding the domain in Vercel).
  site: 'https://v7.vc',
  integrations: [sitemap()],
  server: { host: true, port: 4321 },
});
