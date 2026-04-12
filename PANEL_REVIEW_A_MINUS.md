# OhMySax: D to A- Gap Analysis

**Date:** 2026-04-12
**HEAD:** `6903b65`
**Baseline:** `PANEL_REVIEW_2026-04-12.md` (grade D/D+)
**Target:** A-

---

## Verified Fixes (since panel review)

| Item | Status |
|------|--------|
| Dead `.horn-figure` CSS | FIXED (b3e79d8) |
| Dead `grid-template-columns` on `.horn-entry` | FIXED (357e36c) |
| Dead `.scrolled` JS toggle + missing CSS rule | FIXED (357e36c) |
| `.gitignore` security patterns | FIXED (357e36c — `.env`, `*.key`, `*.pem`, etc.) |
| Contact link missing | FIXED (357e36c — `mailto:andrea@ohmysax.levm.eu` at line 246) |
| Auto-deploy workflow | FIXED (6903b65 — GitHub Action triggers Sisyphus webhook) |
| `posts/` directory removed | FIXED (357e36c — was empty, correctly removed) |

---

## Remaining Gaps (grouped by panel role)

### Cybersecurity — CRITICAL

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| C1 | SSH credentials in HEAD: `DEPLOY_INCIDENT_2026-04-11.md:31` exposes `andrea@<redacted-host>:2222` | CRITICAL | Public repo, live VPS IP + user + port |
| C2 | Same credentials in git history (commit `9b8014c`) — `.gitignore` doesn't help retroactively | CRITICAL | `git log --all --oneline -- DEPLOY_INCIDENT_2026-04-11.md` |
| C3 | No CSP, no security headers beyond what Caddy defaults | LOW | Missing from `index.html` |

### Art Director — HIGH

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| A1 | Zero photos — `images/` is empty | HIGH | Workshop log about physical craft has no visual content |
| A2 | No favicon | MEDIUM | Browser tab shows generic icon |
| A3 | No `og:image` — social shares show no preview | MEDIUM | Missing from `<head>` |

### Sax Repair Technician — HIGH

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| R1 | Vague leak diagnosis: "G key" — which G? G#? Left-hand G? | HIGH | `index.html:63` |
| R2 | "spring mechanism on the stack" — which stack? Which spring type? | HIGH | `index.html:70` |
| R3 | No mention of tools, pad materials, techniques anywhere | HIGH | Entire site |
| R4 | No before/after playing impressions on any repaired horn | HIGH | Missing content |

### Free Jazz Alto Player — MEDIUM

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| F1 | A-992 described as "the benchmark" with zero detail on tone/action/intonation | MEDIUM | `index.html:93` |
| F2 | No mouthpiece/reed setup documented for any horn | MEDIUM | Missing content |
| F3 | No repertoire or practice context — what music gets played on these? | LOW | Missing content |
| F4 | "Not well" is the only playing self-assessment | LOW | `index.html:41` |

### Marketing — MEDIUM

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| M1 | Positioning ambiguity: "might turn into a small repair practice" — is this a portfolio or a log? | MEDIUM | `index.html:222` |
| M2 | No schema.org markup | LOW | Missing structured data |
| M3 | Umami analytics present but no return-visit mechanism (no RSS, no newsletter) | LOW | Dead-end page |

### Technical / Accessibility — MEDIUM

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| T1 | Google Fonts CDN — GDPR IP leak + render-blocking + SPOF | HIGH | `index.html:8-10` |
| T2 | No `aria-expanded` on `.nav-toggle` | MEDIUM | `index.html:25` |
| T3 | No `prefers-reduced-motion` override for `scroll-behavior: smooth` | MEDIUM | `css/style.css:26` |
| T4 | Logo links to `#` (no-op, scrolls to top of current page) | LOW | `index.html:18` |
| T5 | No `README.md` in repo | LOW | Missing |

---

## What A- Requires

An A- means: technically solid, content sufficient to justify the site's existence, no security issues, accessible, GDPR-compliant. The site doesn't need to be feature-complete -- it needs to be _credible_.

### Must-fix for A-

1. **C1+C2**: Sanitize DEPLOY_INCIDENT and rewrite git history (P0)
2. **T1**: Self-host Google Fonts (P0 -- GDPR)
3. **A1**: At least 3 photos -- one of the bench, one of a horn, one of the collection (P1 -- Andrea)
4. **R1+R2**: Sharpen repair descriptions with specific terminology (P1)
5. **F1**: Expand A-992 description with actual playing characteristics (P1)
6. **T2+T3**: Accessibility fixes (P2)
7. **A2+A3**: Favicon + og:image (P2)

### Nice-to-have (A- without, needed for A)

- M1: Resolve positioning ambiguity
- F2/F3: Mouthpiece setup, repertoire context
- R3: Tools and materials section
- M2: schema.org markup
- T5: README.md

---

## Tickets

### TICKET-SAX-001: Sanitize DEPLOY_INCIDENT and rewrite git history

**priority:** P0
**to:** operator (history rewrite requires VPS access for force-push coordination)
**depends_on:** none

Redact `DEPLOY_INCIDENT_2026-04-11.md:31-32` — replace `andrea@<redacted-host>` and port `2222` with `<user>@<host>` and `<port>`. Then `git filter-repo` to remove the original from history. Force-push. Coordinate with any open PRs (none expected). Verify the old commit SHAs are gone from GitHub.

**acceptance_checks:**
- [ ] `git log -p --all -S '<redacted-host>' | wc -l` returns 0
- [ ] `git log -p --all -S '2222' -- DEPLOY_INCIDENT*` returns 0
- [ ] `curl https://api.github.com/repos/alevm/OhMySax/commits?sha=9b8014c` returns 404 or empty
- [ ] VPS SSH still works (key-only auth confirmed)

---

### TICKET-SAX-002: Self-host Google Fonts (GDPR + performance)

**priority:** P0
**to:** pm-ohmysax (hat-switch: architect executes, no PM active)

Download Playfair Display (400, 700, 400i) and Lora (400, 600, 400i) as woff2. Place in `css/fonts/`. Replace lines 8-10 of `index.html` with local `@font-face` declarations using `font-display: swap`. Remove the two `preconnect` links.

**acceptance_checks:**
- [ ] `grep -r 'fonts.googleapis' index.html` returns nothing
- [ ] `grep -r 'fonts.gstatic' index.html` returns nothing
- [ ] `ls css/fonts/*.woff2 | wc -l` >= 6
- [ ] Page loads with fonts visible in Firefox network tab (no external font requests)
- [ ] `font-display: swap` present in every `@font-face` block

---

### TICKET-SAX-003: Add accessibility fixes

**priority:** P2
**to:** pm-ohmysax (hat-switch)

Three changes:
1. `index.html:25` — add `aria-expanded="false"` and `aria-controls="nav-links"` to the `.nav-toggle` button. Update `js/main.js` to toggle `aria-expanded` on click.
2. `css/style.css` — add `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` after line 27.
3. `index.html:18` — change `href="#"` to `href="/"`.

**acceptance_checks:**
- [ ] `grep 'aria-expanded' index.html` returns a match
- [ ] `grep 'aria-controls' index.html` returns a match
- [ ] `grep 'prefers-reduced-motion' css/style.css` returns a match
- [ ] `grep 'href="#"' index.html` returns nothing (logo no longer links to `#`)
- [ ] Mobile nav toggle updates `aria-expanded` attribute on click (manual test)

---

### TICKET-SAX-004: Add favicon + og:image

**priority:** P2
**to:** pm-ohmysax (hat-switch)

Create a simple favicon (can be text-based SVG: "OS" in Playfair Display on patina background). Add `<link rel="icon">` to `<head>`. Add `og:image`, `og:title`, `og:description`, `og:type` meta tags. Use the favicon or a placeholder image for `og:image` until real photos exist.

**acceptance_checks:**
- [ ] `grep 'rel="icon"' index.html` returns a match
- [ ] `grep 'og:image' index.html` returns a match
- [ ] `grep 'og:title' index.html` returns a match
- [ ] Favicon file exists at referenced path
- [ ] `og:image` URL resolves (relative path is fine for now)

---

### TICKET-SAX-005: Sharpen repair descriptions (content — Andrea)

**priority:** P1
**to:** Andrea (content owner)
**type:** content request, not code

The repair descriptions at `index.html:63` and `index.html:70` use vague terminology that undermines the "learning to repair" premise:

1. **A-50 leak** (line 63): specify which G key (G# cluster vs. left-hand G), and whether the low A issue is pad seat, resonator, or bent key guard.
2. **Bundy spring** (line 70): specify upper or lower stack, and flat spring vs. needle spring.
3. **A-992** (line 93): add one sentence on what makes it the benchmark — tone darkness? Evenness across registers? Key action feel?

Also add to each "Playing" horn (5 total) at least one sentence about how it actually sounds/feels, not just that it plays.

**acceptance_checks:**
- [ ] A-50 description names specific key (G# or left-hand G)
- [ ] Bundy description names specific stack and spring type
- [ ] A-992 description explains "benchmark" with at least one tonal/mechanical quality
- [ ] Each of the 5 "Playing" status horns has a playing-feel sentence

---

### TICKET-SAX-006: Add photos (content — Andrea)

**priority:** P1
**to:** Andrea (content owner)
**type:** content request, requires real photos

Minimum 3 photos for A-:
1. The workbench / repair setup
2. At least one horn close-up (keywork, pads, or tone holes)
3. The A-992 (the main player)

Phone photos are fine. Place in `images/`, add `<img>` tags to relevant sections, add `alt` text. Consider `loading="lazy"` for below-fold images.

**acceptance_checks:**
- [ ] `ls images/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l` >= 3
- [ ] Each image has an `alt` attribute in `index.html`
- [ ] At least one image appears in the "On the Bench" or collection section
- [ ] Images are under 500KB each (compress if needed)

---

### TICKET-SAX-007: Add README.md

**priority:** P3
**to:** pm-ohmysax (hat-switch)

Add a minimal `README.md`: project name, one-line description, local dev instructions (`open index.html`), deploy mechanism (push to main triggers Sisyphus webhook).

**acceptance_checks:**
- [ ] `test -f README.md` passes
- [ ] README mentions deploy mechanism
- [ ] README does not contain secrets or internal URLs

---

## Grade Projection

| Fix set | Projected grade |
|---------|----------------|
| Current state | D |
| + SAX-001 (sanitize creds) + SAX-002 (self-host fonts) | C+ |
| + SAX-003 (a11y) + SAX-004 (favicon/og) | B- |
| + SAX-005 (repair descriptions) + SAX-006 (3 photos) | A- |
| + SAX-007 (README) + positioning decision + schema.org | A |

**Estimated agent effort (code tickets only, excluding Andrea's content):** ~15 agent-minutes total for SAX-001 through SAX-004 + SAX-007. SAX-005 and SAX-006 require Andrea's input/photos and cannot be automated.

---

*Analysis by architect, 2026-04-12. Panel roles consulted: Cybersecurity, Art Director, Sax Repair Technician, Free Jazz Alto Player, Marketing.*
