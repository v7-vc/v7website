/**
 * Contact form delivery config.
 *
 * Two modes, chosen at build time so that pushing this repo can never disable a
 * working form:
 *
 *  - `web3forms` — active as soon as PUBLIC_WEB3FORMS_KEY is set. Uses a normal
 *    CORS request and reads the JSON response, so "sent" means the provider
 *    actually accepted the enquiry.
 *
 *  - `legacy` — the fallback when no key is configured. Posts to the existing
 *    Zapier catch hook exactly as the current production site does. Zapier's
 *    hook has no CORS headers, so this path must stay `no-cors` and therefore
 *    cannot confirm delivery — it reports success optimistically. That is a
 *    known limitation, kept deliberately so behaviour does not regress before
 *    the key exists.
 *
 * To switch to Web3Forms: get a key at https://web3forms.com for the inbox that
 * should receive enquiries, then set it in `.env` AND in
 * Vercel → Settings → Environment Variables:
 *
 *   PUBLIC_WEB3FORMS_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 */
const KEY = (import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '').trim();

const LEGACY_ENDPOINT = 'https://hooks.zapier.com/hooks/catch/24172971/u6x858o/';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

export const FORM_CONFIGURED = KEY.length > 0 && !KEY.startsWith('REPLACE');

export const FORM_PROVIDER: 'web3forms' | 'legacy' = FORM_CONFIGURED ? 'web3forms' : 'legacy';

export const FORM_ENDPOINT = FORM_CONFIGURED ? WEB3FORMS_ENDPOINT : LEGACY_ENDPOINT;

export const FORM_KEY = KEY;
