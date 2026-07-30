# V7 — Content admin (Sveltia CMS) & deploy pipeline

The site content (the portfolio **Projects**) is editable through a small admin UI
at **`/admin`**, backed by [Sveltia CMS](https://github.com/sveltia/sveltia-cms)
(free, open-source, git-based, Decap-compatible). No database, no server of ours —
edits are committed to the Git repo and the site rebuilds.

Two ways to run it:

- **Local (works today, no accounts):** edit on your machine, changes write to the
  real files in this repo.
- **Live (set up when going to prod):** log in with GitHub at `/admin` on the
  deployed site; only accounts with **write access** to the repo can save.

---

## A. Local editing (now)

```bash
# 1. run the tiny local proxy that lets the CMS write to disk
npx @sveltia/cms-proxy-server
# 2. in another terminal, run the site
npm run dev
# 3. open http://localhost:4321/admin  → "Work with Local Repository"
```

`local_backend: true` is already set in `public/admin/config.yml`, so no login is
needed locally. Saving updates `src/data/projects.json` (and
`public/assets/images/…` for images) directly. Commit those changes as usual.

Verified round-trip: editing a project's field in `src/data/projects.json` shows
up on the homepage grid and on `/projects/<slug>` after a rebuild.

---

## B. Live pipeline — current state

`public/admin/config.yml` now points at the real repo:

```yaml
backend:
  name: github
  repo: kostenkoelena500-prog/v7website
  branch: main
media_folder: "public/assets/images"   # where card/logo images already live
public_folder: "/assets/images"
```

Remaining steps, each needing an action from the repo/Vercel owner:

### 1. Push the current code to `main` — **needs the owner's GitHub token**
`origin` is `https://github.com/kostenkoelena500-prog/v7website.git` (HTTPS), so
the push needs credentials. Reconcile with `origin/main` first; never force-push
over unknown history.

### 2. Git repo ↔ Vercel (enables auto-deploy = "stage")
- `npx vercel git connect` from the project root (`.vercel/` already links the
  project `v7website`).
- If Vercel cannot see the repo, install the **Vercel GitHub app** on
  `kostenkoelena500-prog/v7website` (repo Settings → Integrations) — a one-time
  click by the repo owner — then retry.
- Confirm the project's **Production Branch = `main`**.
- After this, every commit (including ones the CMS makes) auto-deploys. That
  deployed URL is our **stage**.

### 2. GitHub OAuth app (so `/admin` login works)
- GitHub → Settings → Developer settings → **OAuth Apps** → New:
  - **Homepage URL:** `https://<your-site>`
  - **Authorization callback URL:** `https://<worker-subdomain>.workers.dev/callback`
- Copy the **Client ID** and generate a **Client secret**.

### 3. OAuth proxy (Cloudflare Worker — code included)
Code lives in `workers/sveltia-oauth/`.
```bash
cd workers/sveltia-oauth
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID       # paste Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET   # paste Client secret
# edit wrangler.toml → ALLOWED_ORIGINS = your admin site origin
npx wrangler deploy
```
This gives a `https://<worker-subdomain>.workers.dev` URL.

### 4. Point the CMS at the repo + proxy
In `public/admin/config.yml`:
```yaml
local_backend: false            # turn off local mode for the live site
backend:
  name: github
  repo: OWNER/REPO              # the repo Vercel deploys from (step 1)
  branch: main
  base_url: https://<worker-subdomain>.workers.dev
```
Redeploy the site. Now `/admin` shows **Login with GitHub**; only repo
collaborators can save. Their saves commit to `main` → Vercel auto-deploys → stage.

### 5. Prod (later, when domains are provided)
- Add the real domain to the Vercel project; that becomes **prod**.
- Promotion flow options:
  - simplest: `main` = prod, use a `stage` branch for previews; or
  - keep stage = Vercel preview deploys, and **Promote to Production** in the
    Vercel dashboard when happy.
- Nothing in the CMS changes — only where the domain points.

---

## What the future owner can do
- **Add / edit / reorder projects** via `/admin` (table + form: name, category,
  slug, website, card image, logo, tagline, industry, about).
- **Make broader changes via Claude Code** → commit → auto-deploy to stage →
  promote to prod.

## Notes
- Images uploaded in the CMS go to `public/uploads/` and are committed to the repo.
- The Projects data source of truth is `src/data/projects.json`.
- Keeping everything git-based means: full history, easy rollback, zero lock-in.
