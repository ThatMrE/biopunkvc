# Deployment — biopunkvc.com

The site is a **static site** (no build step). Netlify publishes the repository root
(`publish = "."` in `netlify.toml`) verbatim.

## Continuous deploy (git → Netlify)

1. The Netlify site for **biopunkvc.com** is connected to this GitHub repo.
2. Every push to `main` auto-deploys within ~30 seconds.
3. No build command, no framework — Netlify just serves the files.

## Custom domain

- Apex: **biopunkvc.com** (primary)
- `www.biopunkvc.com` → `biopunkvc.com` via the 301 in `netlify.toml` / `_redirects`
- Netlify provisions the TLS certificate automatically.

If DNS is not yet pointed at Netlify: in the Netlify dashboard → **Domain management**,
add `biopunkvc.com`, then either use Netlify DNS or point your registrar's records at
Netlify (the dashboard shows the exact `A` / `CNAME` values). Propagation can take up
to 24h.

## Community submissions (Netlify Forms)

The *"Add a funding source"* form uses **Netlify Forms** — no backend required.

- The form is named `capital-map-submission` and is detected by Netlify at deploy time
  (a hidden static copy of the form exists in `index.html` for detection; the visible
  form is progressively enhanced by `assets/app.js` to submit via `fetch`).
- Submissions appear in the Netlify dashboard under **Forms**.
- To get notified: Netlify dashboard → **Forms → Settings & notifications** → add an
  email (or Slack) notification. Point it at the maintainer's inbox.
- A honeypot field (`bot-field`) filters basic spam. Enable Netlify's built-in spam
  filtering / reCAPTCHA in the dashboard if needed.

Reviewed submissions get added to `assets/data.js` (directly or via PR) — that commit
is the only thing that publishes them to the live map.

## Caching

Set in `netlify.toml`:

- `assets/data.js` → `max-age=0, must-revalidate` (the map must always be current)
- `*.html` → `max-age=0, must-revalidate`
- other `/assets/*` → short cache with revalidation
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) applied site-wide.

## Post-deploy checklist

- [ ] `https://biopunkvc.com` loads the Capital Map
- [ ] `https://www.biopunkvc.com` redirects to the apex
- [ ] Search, category chips, and capital/stage filters work
- [ ] Submitting the form shows the success message and a row appears in Netlify → Forms
- [ ] Form notification email is configured

For questions: er.creates@gmail.com
