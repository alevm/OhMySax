# OhMySax

Static site: vintage saxophone repair workshop log. Hosted on Sisyphus (Caddy reverse proxy), deployed via GitHub webhook on push to `main`.

## Stack

- Plain HTML/CSS/JS (no build step)
- Fonts: self-hosted in `css/fonts/` (Playfair Display, Lora) -- no Google Fonts CDN
- Analytics: Umami at `analytics.levm.eu`
- Deploy: push to main triggers Sisyphus webhook (see `.github/workflows/`)

## Structure

```
index.html          Main landing page
workshop.html       Workshop log (chronological entries)
comparisons.html    Before/after photo comparisons (side-by-side)
admin.html          CMS admin — commits to GitHub API, no git push needed
data/workshops.json Workshop entries (source of truth)
data/comparisons.json Before/after comparisons (source of truth)
css/style.css       Main styles
css/fonts.css       @font-face declarations
css/fonts/          Self-hosted woff2 files
js/main.js          Mobile nav toggle
js/workshop.js      Workshop page renderer (fetches JSON, renders client-side)
js/comparisons.js   Comparisons page renderer
js/admin.js         CMS logic (GitHub Contents API, photo upload, token in localStorage)
images/             Photos + favicon.svg
```

## CMS workflow

1. Go to `/admin.html`
2. Paste a GitHub PAT with `repo` scope (stored in browser localStorage only)
3. Add workshop entries, before/after comparisons, or upload photos
4. Each save commits to `main` via GitHub API, which triggers the Sisyphus deploy webhook automatically

No git CLI needed. Token never leaves the browser except to `api.github.com`.

## Panel review status

See `PANEL_REVIEW_A_MINUS.md` for full gap analysis. Current grade: ~B+ (all code/content fixes done).

### Remaining for A-
- **SAX-001** (P0): SSH creds in git history -- ticket written to operator
- **SAX-006** (P1): Add 3+ real photos -- needs Andrea's phone camera

### Done
- SAX-002: Google Fonts self-hosted (GDPR fix)
- SAX-003: Accessibility (aria-expanded, prefers-reduced-motion, logo href)
- SAX-004: Favicon + og:image/title/description/type
- SAX-005: Repair descriptions sharpened (G# cluster, flat spring, pad materials, playing-feel for all horns)
- R3: Tools & Materials section added
- M1: Positioning clarified (workshop log toward repair practice)
- M2: schema.org structured data added
- F4: Intro voice sharpened
- Semantic `<main>` wrapper added

## Local dev

```bash
open index.html
# or
python3 -m http.server 8000
```
