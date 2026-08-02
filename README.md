# Biopunk — The Early-Stage Biotech Capital Map

**[biopunkvc.com](https://biopunkvc.com)** is an open, continuously-updated map of the
**earliest financing for biotech founders — in every form**: non-dilutive grants,
accelerators, pre-seed & seed VCs, venture studios, fellowships, angel syndicates,
prizes, and crowdfunding.

Biopunk is a **resource, not a fund.** (The investing happens at
[haus.fund](https://haus.fund); the broader ecosystem lives at
[biopunk.house](https://biopunk.house).)

## What's here

A fast, framework-free static site. Everything is plain HTML/CSS/JS — no build step.

```
index.html          Landing page + the interactive Capital Map
assets/styles.css    Styles (dark / neon-green / punk-pink brand)
assets/data.js       THE DATA — the directory of funding sources (edit this to contribute)
assets/app.js        Rendering, search, filtering, sorting, submit-form logic
netlify.toml         Netlify config (www→apex redirect, headers, no-cache for data.js)
_redirects           www→apex redirect
```

## The data model

Every funding source in `assets/data.js` is one object:

```js
{
  id:     "indiebio-sosv",              // slug (unique)
  name:   "IndieBio (SOSV)",
  type:   "Accelerator",                // see categories below
  capital:"Mixed",                      // Non-dilutive | Equity | Convertible/SAFE | Mixed
  stage:  "Pre-seed–Seed",              // Idea | Pre-seed | Pre-seed–Seed | Seed
  amount: "$250K–$525K",                // check / grant size (free text)
  geo:    "US (SF, NY)",                // geography
  focus:  "All biotech / deep-tech bio",
  url:    "https://indiebio.co",
  hq:     "San Francisco / New York (SOSV)",
  blurb:  "One sentence on what/whom they fund at the earliest stage.",
  call:   "Rolling",                    // Rolling | Cohorts | Recurring | Closed
  sector: "Therapeutics"                // theme (auto-classified in build.js from focus/name/blurb)
}
```

**Categories (`type`):** Accelerator · Pre-seed/Seed VC · Corporate VC · Venture Studio ·
Government Grant · Philanthropic Grant · Fellowship · Angel/Syndicate ·
Prize/Competition · Crowdfunding.

**Sectors (`sector`):** Therapeutics · Oncology & Immunology · Neuroscience · Rare & Genetic
Disease · Longevity & Aging · Global & Infectious Health · Diagnostics & Devices · Genomics ·
Platforms & Tools · Digital & Data / TechBio · Synbio & Biomanufacturing · Agtech & Food ·
Climate & Industrial Bio · Cross-cutting / All Biotech. Sector is a soft theme tag derived
from each entry's focus text, so the map can be sliced by area (Category and Sector are
separate axes — a "Pre-seed/Seed VC" can be "Agtech & Food"). The site's filter bar keeps
Category + Sector visible and tucks capital/stage/status/sort behind a "More filters"
disclosure, with active filters shown as removable pills.

**Application status (`call`):** `Rolling` (apply anytime) · `Cohorts` (batch intake) ·
`Recurring` (cyclical call/RFA) · `Closed` (dormant). Surfaced on each card and
filterable, so founders can find what's **open to apply to** right now. Because live
deadlines shift, `call` uses these durable states rather than hard dates — always
follow the source's link for the current window.

The site reads this file directly; the counts, filters, and category chips all derive
from the data — add an entry and everything updates automatically.

## Contribute a funding source

Two ways, both welcome:

1. **On the site** — use the *"Add a funding source"* form on
   [biopunkvc.com](https://biopunkvc.com). Submissions go to Netlify Forms; we review
   them before adding to the map.
2. **Open a PR** — add or correct an object in `assets/data.js`, keeping it valid JS.
   Keep `blurb` to one honest sentence and prefer real, verifiable amounts (approximate
   ranges are fine; use `"Varies"` when unknown).

## Run locally

No dependencies:

```bash
python3 -m http.server 8099    # then open http://127.0.0.1:8099
```

## Deploy

Static site on Netlify — push to `main` and Netlify serves the repo root verbatim.
The dataset (`assets/data.js`) is served with `max-age=0, must-revalidate` so the map
is always current. See `DEPLOYMENT.md` for domain and form setup.

---
&copy; 2026 Biopunk · Building the map of the earliest capital for biotech.
