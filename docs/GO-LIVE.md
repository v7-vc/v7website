# Go-live checklist — what's left before the real domain

Everything below is prepared; each item is one action + one verification.
State as of 2026-07-31: clone is 1:1 on 1309/736/390, CMS edits verified
end-to-end locally, form ships in the safe legacy mode.

## 1. Domain (one line + Vercel)

- [ ] `astro.config.mjs` → `site: 'https://…'` — **the only place the domain
  lives**. Canonical, `og:url`, sitemap and robots.txt all derive from it.
- [ ] Vercel → project `v7website` → Settings → **Domains** → add the domain,
  point DNS per Vercel's instructions.
- Verify: `curl -s https://<domain>/robots.txt` shows the new domain in the
  `Sitemap:` line; page source shows the new canonical.
- Note: `workers/sveltia-oauth/wrangler.toml` → `ALLOWED_ORIGINS` also mentions
  the deploy URL — update it *if/when* the hosted CMS login (OAuth worker) is
  activated. Not needed before that.

## 2. Contact form → real delivery (needs the client's inbox)

- [ ] Get an access key at https://web3forms.com for the inbox that should
  receive enquiries.
- [ ] Put it in `.env` (`PUBLIC_WEB3FORMS_KEY=…`, see `.env.example`) **and** in
  Vercel → Settings → Environment Variables.
- [ ] Redeploy. The build flips both forms to Web3Forms automatically
  (`data-provider="web3forms"` in the HTML is the tell).
- Verify (the real criterion): submit a test enquiry on the live site → **the
  email physically arrives** in the inbox. Not just a 200.
- Until then the forms post to the existing Zapier hook exactly as production
  always did (`data-provider="legacy"`), so nothing regresses.
- Open questions: does the old Zapier Zap actually deliver mail? (nobody has
  confirmed); file uploads on `/contact` need a paid Web3Forms plan — decide
  paid plan vs. dropping the attachment field vs. another provider.

## 3. Git auto-deploy (needs one click by the repo owner)

- [ ] Elena: github.com/kostenkoelena500-prog/v7website → Settings →
  Integrations → GitHub Apps → install/Configure **Vercel** → grant access to
  `v7website`. (Blocked for us: the repo is private and our account has
  `push` but not `admin`.)
- [ ] Then from this repo:
  `npx vercel git connect https://github.com/kostenkoelena500-prog/v7website.git --yes`
  (the explicit URL matters — this workspace is a git worktree, plain
  `git connect` fails with "No local Git repository found").
- [ ] Vercel → confirm Production Branch = `main`.
- Verify: push a trivial commit → the Vercel dashboard shows a **git-triggered**
  deployment (not CLI) and the stage URL updates.

## 4. CMS for the editor (already working, two modes)

- Local (works now): `npm run dev` → open `/admin` → **Work with Local
  Repository** → pick the repo folder in the native dialog (a human click by
  browser design). Edits write to `src/data/projects.json`; commit + push.
- After step 3, a push (hand-made or CMS-made) auto-deploys.
- Verified end-to-end: adding a 9th project through the CMS write-path
  generates the page, the homepage card, the `(9)`/`Projects⁹` counters (now
  computed, not hardcoded) and the sitemap entry; removing it restores 8.
- Hosted `/admin` login (edit from any browser without the local folder) stays
  optional: GitHub OAuth app + `wrangler deploy` of `workers/sveltia-oauth` +
  uncomment `base_url` in `public/admin/config.yml` — steps in CMS-SETUP.md.

## Known deliberate deviations

- "Let's talk." block sits +28px right of the original (client request).
- Footer year shows 2025 to match the original verbatim.
