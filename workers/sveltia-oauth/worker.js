/**
 * GitHub OAuth proxy for Sveltia CMS (Decap-compatible), as a Cloudflare Worker.
 *
 * Why this exists: the CMS is a static page (/admin) with no backend of ours.
 * GitHub's OAuth "exchange code → token" step must run server-side (the client
 * secret can't live in the browser). This tiny Worker is that server-side step.
 *
 * Deploy (see docs/CMS-SETUP.md for the full walkthrough):
 *   1. Create a GitHub OAuth App:
 *        Homepage URL:            https://<your-site>
 *        Authorization callback:  https://<worker-subdomain>.workers.dev/callback
 *   2. Set Worker secrets:
 *        npx wrangler secret put GITHUB_CLIENT_ID
 *        npx wrangler secret put GITHUB_CLIENT_SECRET
 *   3. Deploy:  npx wrangler deploy
 *   4. In public/admin/config.yml set:
 *        base_url: https://<worker-subdomain>.workers.dev
 *
 * Only GitHub accounts with WRITE access to the configured repo can actually
 * save changes — that is the "admin only" gate.
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';

// Sveltia/Decap expect the popup to receive a postMessage on this exact shape.
function popupResponse(status, payload, origin) {
  const body = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html><body><script>
    (function () {
      function post() { window.opener && window.opener.postMessage(${JSON.stringify(body)}, "${origin}"); }
      window.addEventListener("message", post, false);
      post();
    })();
  </script></body></html>`;
}

function randomState() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Lock the popup origin to the site(s) allowed to use this proxy.
    const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim());
    const originFor = () => (allowed[0] === '*' ? url.origin : allowed[0]);

    // Step 1 — start the OAuth dance.
    if (url.pathname === '/auth') {
      const state = randomState();
      const redirect = new URL(GITHUB_AUTHORIZE);
      redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      redirect.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
      redirect.searchParams.set('state', state);
      redirect.searchParams.set('redirect_uri', `${url.origin}/callback`);
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirect.toString(),
          'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
        },
      });
    }

    // Step 2 — GitHub redirects back with ?code; exchange it for a token.
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('Cookie') || '';
      const saved = /oauth_state=([^;]+)/.exec(cookie)?.[1];
      if (!code || !state || state !== saved) {
        return new Response(popupResponse('error', { message: 'Invalid OAuth state' }, originFor()), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      const res = await fetch(GITHUB_TOKEN, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });
      const data = await res.json();
      if (data.error || !data.access_token) {
        return new Response(popupResponse('error', { message: data.error || 'No token' }, originFor()), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
      return new Response(
        popupResponse('success', { token: data.access_token, provider: 'github' }, originFor()),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return new Response('Sveltia OAuth proxy. Use /auth to start.', { status: 200 });
  },
};
