import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://v7.vc',
  server: { host: true, port: 4321 },
});
