# Biopunk — The Early-Stage Biotech Capital Map

**[biopunkvc.com](https://biopunkvc.com)** is an open, continuously-updated map of the
**earliest financing for biotech founders — in every form**: non-dilutive grants,
accelerators, pre-seed & seed VCs, venture studios, fellowships, angel syndicates,
prizes, and crowdfunding.

Biopunk is a **resource, not a fund.** The investing happens at
[haus.fund](https://haus.fund). The broader ecosystem lives at
[biopunk.house](https://biopunk.house).

## What is here

A fast, framework-free static site. Everything is plain HTML, CSS and JS, with no build step.

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
Climate & Industrial Bio · Cross-cutting / All Biotech. Sector is a soft theme tag that comes
from each entry's focus text, so you can slice the map by area. Category and Sector are
separate axes: a "Pre-seed/Seed VC" can also be "Agtech & Food". The filter bar keeps
Category and Sector visible and puts capital, stage, status and sort behind a "More filters"
disclosure. Active filters appear as removable pills.

**Application status (`call`):** `Rolling` (apply anytime) · `Cohorts` (batch intake) ·
`Recurring` (cyclical call/RFA) · `Closed` (dormant). Each card shows this state and the
filter bar accepts it, so a founder can find what is **open to apply to** right now. Live
deadlines shift, so `call` holds these durable states rather than hard dates. Always
follow the source's link for the current window.

The site reads this file directly. The counts, filters and category chips all derive
from the data, so one new entry updates everything.

## Contribute a funding source

Two ways, both welcome:

1. **On the site** — use the *"Add a funding source"* form on
   [biopunkvc.com](https://biopunkvc.com). Submissions go to Netlify Forms. We review
   them before they reach the map.
2. **Open a PR** — add or correct an object in `assets/data.js`, keeping it valid JS.
   Keep `blurb` to one honest sentence and prefer real, verifiable amounts (approximate
   ranges are fine; use `"Varies"` when unknown).

## Run locally

No dependencies:

```bash
python3 -m http.server 8099    # then open http://127.0.0.1:8099
```

## Deploy

Push to `main`. Netlify serves the repo root verbatim, and the map stays current because
`assets/data.js` carries a no-cache header. `DEPLOYMENT.md` covers the domain, the caching
rules and the form setup.

---
&copy; 2026 Biopunk · Building the map of the earliest capital for biotech.
