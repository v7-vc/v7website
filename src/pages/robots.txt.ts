import type { APIRoute } from 'astro';

// Generated so the domain comes from astro.config's `site` — changing the
// domain stays a one-line change.
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://v7.vc')).href.replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
