# CLAUDE.md

Project context: **CONTEXT.md** (v7.vc Framer→code migration).
Mandatory rules: **RULES.md** — (1) use the relevant skill before every task,
(2) answer concisely unless asked to expand.

## Working agreements (always apply — full version in `skill.md`)
1. **Concise by default.** Short, result-first answers. Expand only when explicitly asked.
2. **Use Superpowers during implementation.** brainstorming before new features, TDD for code,
   systematic-debugging for bugs, verification-before-completion before claiming done.
3. **Grill me when unclear.** Ask clarifying questions instead of guessing on ambiguous asks.
4. **Pixel-perfect 1:1.** The rebuild must match https://v7.vc pixel-for-pixel. Before claiming a
   section done: measure the live original at the SAME viewport width (computed styles/positions),
   compare desktop (1200+), tablet (810–1199) and phone (390), then verify our version matches.
   Never invent layout — measure first, then code.

## Deploying (staging → production)

Two branches drive the live site. Vercel builds each on push, no manual step:

| branch | URL | role |
|---|---|---|
| `staging` | https://staging.v7.vc | where every change lands first |
| `main` | https://v7.vc | the live site |

`public/admin` (Sveltia CMS) commits to `staging`, so content edits appear on
staging automatically about a minute after Save.

**Always work on `staging`.** Never commit or push straight to `main`.

**To publish** — when asked to "залити на прод" / "publish" / "go live":

```bash
git fetch origin
git log --oneline origin/main..origin/staging   # show what is about to go live
git push origin origin/staging:main             # publish
```

Before publishing, verify staging is sound: `npm run build` passes, every
`card`/`logo` path in `src/data/projects.json` exists under `public/`, and no
two projects share a `slug`. Report what shipped afterwards.

**To roll back** — put main back on the previous commit:

```bash
git push origin <previous-main-sha>:main --force-with-lease
```

## Images

The CMS ships whatever the client uploads, so `public/assets/images/` holds
full-resolution exports. `src/integrations/optimize-images.mjs` resizes and
re-encodes them into `dist/` at build time — sources are never modified.

If the client reports images looking soft, raise `MAX_WIDTH` there (or remove
the resize) and rebuild; the originals are still in the repo, so quality comes
straight back.
