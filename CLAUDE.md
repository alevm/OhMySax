# OhMySax

Static site: vintage saxophone repair workshop log. Hosted on Sisyphus (Caddy reverse proxy), deployed via GitHub webhook on push to `main`.

## Stack

- Plain HTML/CSS/JS (no build step)
- Fonts: self-hosted in `css/fonts/` (Playfair Display, Lora) -- no Google Fonts CDN
- Analytics: Umami at `analytics.levm.eu`
- Deploy: push to main triggers Sisyphus webhook (see `.github/workflows/`)

## Structure

```
index.html          Single-page site
css/style.css       Main styles
css/fonts.css       @font-face declarations
css/fonts/          Self-hosted woff2 files
js/main.js          Mobile nav toggle
images/             Photos + favicon.svg
```

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
