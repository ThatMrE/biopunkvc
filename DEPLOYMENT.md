# Deployment — biopunkvc.com

A static site, with no build step. Netlify publishes the repository root verbatim
(`publish = "."` in `netlify.toml`).

## Continuous deploy (git → Netlify)

1. The Netlify site for **biopunkvc.com** connects to this GitHub repo.
2. Every push to `main` deploys within about 30 seconds.
3. No build command and no framework. Netlify serves the files.

## Custom domain

- Apex: **biopunkvc.com** (primary)
- `www.biopunkvc.com` → `biopunkvc.com` via the 301 in `netlify.toml` / `_redirects`
- Netlify provisions the TLS certificate automatically.

If DNS does not point at Netlify yet, open the Netlify dashboard → **Domain management**
and add `biopunkvc.com`. Then either use Netlify DNS or point your registrar's records at
Netlify. The dashboard shows the exact `A` and `CNAME` values. Propagation can take up
to 24 hours.

## Community submissions (Netlify Forms)

The *"Add a funding source"* form uses **Netlify Forms**. It needs no backend.

- The form carries the name `capital-map-submission`, which Netlify detects at deploy
  time. A hidden static copy in `index.html` makes that detection work. `assets/app.js`
  then enhances the visible form to submit through `fetch`.
- Submissions appear in the Netlify dashboard under **Forms**.
- To get notified: Netlify dashboard → **Forms → Settings & notifications** → add an
  email (or Slack) notification. Point it at the maintainer's inbox.
- A honeypot field (`bot-field`) filters basic spam. Enable Netlify's built-in spam
  filtering / reCAPTCHA in the dashboard if needed.

A maintainer adds reviewed submissions to `assets/data.js`, directly or through a PR.
That commit is the only thing that publishes them to the live map.

## Caching

Set in `netlify.toml`:

- `assets/data.js` → `max-age=0, must-revalidate` (the map must always be current)
- `*.html` → `max-age=0, must-revalidate`
- other `/assets/*` → short cache with revalidation
- Security headers apply site-wide: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy` and `Permissions-Policy`.

## Post-deploy checklist

- [ ] `https://biopunkvc.com` loads the Capital Map
- [ ] `https://www.biopunkvc.com` redirects to the apex
- [ ] Search, category chips, and capital/stage filters work
- [ ] Submitting the form shows the success message and a row appears in Netlify → Forms
- [ ] Form notification email is configured

For questions: er.creates@gmail.com
