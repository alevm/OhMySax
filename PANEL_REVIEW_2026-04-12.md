# 24-ROLE EXPERT PANEL REVIEW (DELTA) -- OhMySax

**Date:** 2026-04-12
**Baseline:** `ARCHITECT_REVIEW_2026-04-11.md` @ `10aba4d`
**Current HEAD:** `51bff8f` (2 commits since baseline)
**Scope:** Delta review -- what changed, what didn't, new issues

---

## Changes since baseline

| Commit | What |
|--------|------|
| `b3e79d8` | Remove dead `.horn-figure` CSS rule |
| `51bff8f` | Add Umami analytics tracking |

Also: `.gitignore` created (1 line: `ARCHITECT_REVIEW_2026-04-11.md`).

---

## Panel Verdicts

### 1. PM -- CONCERNING (was: CONCERNING)

**Verdict:** No change. Zero backlog items closed. `OHMYSAX-INSTRUCTIONS.md:32` "evidence-based values from eBay/Reverb/Leboncoin" still open, no checkbox, no cancellation. No `README.md`. `posts/` still empty. Workshop log section still a promise with zero content.

from: architect (PM)

---

### 2. UI/UX -- CONCERNING (was: CONCERNING)

**Verdict:** No change. `images/` still empty. A workshop log without photos remains a contradiction. No `aria-expanded` on `.nav-toggle` (`index.html:25`). No `prefers-reduced-motion` override for `scroll-behavior: smooth` (`css/style.css:26`). Logo still links to `#` (`index.html:18`). No favicon, no `og:image`.

from: architect (UI/UX)

---

### 3. Free Jazz Alto Player -- CONCERNING

**Verdict:** The collection inventory (`index.html:85-191`) is an interesting snapshot but lacks any practice-log quality. No repertoire documented, no tone development notes, no mention of mouthpiece/reed setup on any of the 11 horns. The "On the Bench" section (`index.html:53-75`) is a repair queue, not a playing log. A site called "Learning to Fix What I Love" should document what the player hears when testing repaired horns -- e.g., how does the Bundy sound after repad vs. before? Which horn do you grab for Ornette tunes vs. Cannonball standards? The Yanagisawa A-992 is described only as "the benchmark" (`index.html:93`) -- benchmark for what? Tone? Action? Intonation? The 5 "Playing" horns deserve at least one sentence each on how they actually play, not just that they do.

- `index.html:93` -- A-992 description is functionally empty for a player
- `index.html:41` -- "Not well" is honest but also the only playing self-assessment on the entire site
- `posts/` -- zero workshop entries documenting sound tests, leak-light results, or before/after playing impressions

from: architect (Free Jazz Alto Player)

---

### 4. Sax Repair Technician -- CONCERNING

**Verdict:** The repair documentation is thin. `index.html:63` says "Leaks on the G key and low A" for the A-50 -- which G key? G# cluster or left-hand G? Low A leak could be the pad, the resonator, or a bent key guard. `index.html:70` says "spring mechanism on the stack is blocking final closure" on the Bundy -- which stack? Upper or lower? Flat spring or needle spring? No photos of keywork, pads, tone holes, or leak-light tests in the entire repo (`images/` empty). No mention of tools owned, pad types used (leather vs. synthetic, rivet vs. floating), or cork/felt sourcing. The Conn New Wonder "rolled tone holes" mention (`index.html:129`) is correct terminology but zero follow-up on condition. For a site about learning repair, the absence of any technical detail is the main gap.

- `index.html:63` -- vague leak diagnosis
- `index.html:70` -- spring issue undocumented
- `images/` -- zero photos of any repair work
- No mention of pad materials, tools, or techniques anywhere

from: architect (Sax Repair Technician)

---

### 5. Musicologist -- OK

**Verdict:** The collection is genuinely interesting from an organological standpoint -- 11 altos spanning 4 countries and nearly a century (Ida Maria Grassi 1926 to modern Yanagisawa). The "Why Vintage Saxophones" section (`index.html:195-212`) is a clean articulation of the vintage-vs-modern debate. However: no serial numbers documented, no approximate dates for most horns (only the Grassi has a year), no mention of bore geometry or tonal characteristics by maker. The Conn New Wonder Series I and Martin Handcraft are historically significant instruments that deserve more context than "needs everything."

- `index.html:164-169` -- Grassi is the only horn with a date
- `index.html:124-130` -- Conn and Martin lack historical context

from: architect (Musicologist)

---

### 6. Art Director -- CONCERNING (was: CONCERNING)

**Verdict:** Visual presentation unchanged. The CSS palette (ink-on-paper, patina accent) is coherent and appropriate for the subject matter. Typography choices (Playfair Display + Lora) are solid for an editorial/craft feel. But the site is 100% text with zero visual content -- no photos, no illustrations, no diagrams. For a workshop log about physical craft on beautiful vintage instruments, this is a critical gap. The `.horn-entry` border-left treatment (`css/style.css:271-273`) is elegant but repetitive across 11 identical entries with no visual hierarchy. Status pills work but are the only visual differentiation.

- `images/` -- empty directory
- `css/style.css:271-273` -- border-left is the only visual accent across 11 entries

from: architect (Art Director)

---

### 7. Marketing -- CONCERNING (was: CONCERNING)

**Verdict:** No change. Still no contact channel (`index.html:243-246` -- "I'd love to hear from you" with no email, no form, no link). No `og:image`, no favicon, no schema.org markup. Analytics added via Umami (`index.html:12`) -- this partially addresses the "no way to know if anyone reads" finding, but Umami without any CTA or return-visit mechanism (RSS, newsletter) just measures bounce rate on a dead-end page.

- `index.html:12` -- Umami added (new, good)
- `index.html:246` -- still no contact method (unchanged, bad)
- No schema.org, no og:image, no favicon

from: architect (Marketing)

---

## Verification: "Dead CSS was fixed"

**Claim partially verified.**

- `.horn-figure img` rule: **REMOVED** in `b3e79d8`. Confirmed absent from `css/style.css`. FIXED.
- `.scrolled` class: was flagged as dead in baseline (`js/main.js:19` sets it, CSS never styles it). Still dead -- `js/main.js:19` still toggles `.scrolled`, `css/style.css` still has no `.site-header.scrolled` rule. **NOT FIXED.**
- `grid-template-columns` on `.horn-entry`: still present at `css/style.css:400` and `:411`. `.horn-entry` is not `display: grid` -- it has no display property, inherits from `.horn-list` which is `display: flex`. These grid properties are still inert. **NOT FIXED.**

---

## Dual Grade

| Axis | Grade |
|------|-------|
| **Technical (code + infra)** | D+ (unchanged -- no security/SRE fixes shipped) |
| **Content (workshop log quality)** | D (no content added, no photos, no repair documentation) |

---

## Top 5 Risk Score

| # | Risk | Severity | File:Line | Status vs baseline |
|---|------|----------|-----------|-------------------|
| 1 | SSH credentials + VPS IP in public repo | CRITICAL | `DEPLOY_INCIDENT_2026-04-11.md:31` | **UNCHANGED** -- still in git history, still in HEAD |
| 2 | `.gitignore` only ignores review file, not `.env`/`*.key`/`*.pem`/`credentials.*` | CRITICAL | `.gitignore:1` | **REGRESSED** -- .gitignore exists but is functionally useless for security |
| 3 | Google Fonts CDN = GDPR IP leak + render-blocking | HIGH | `index.html:8-10` | UNCHANGED |
| 4 | No auto-deploy, no validate.sh, no drift detection | HIGH | (missing files) | UNCHANGED |
| 5 | `js/main.js:5` no null-guard + dead `.scrolled` code | MEDIUM | `js/main.js:5,19` | UNCHANGED |

---

## Tickets (max 10)

### T1 -- CRITICAL: Sanitize DEPLOY_INCIDENT and rewrite git history
**Priority:** P0
**Owner:** operator (history rewrite) + project (file edit)
SSH credentials at `DEPLOY_INCIDENT_2026-04-11.md:31` remain in a PUBLIC repo. Replace IP/user/port with placeholders, then `git filter-repo` + force-push. Verify key-only SSH on VPS.

### T2 -- CRITICAL: Fix .gitignore to include security patterns
**Priority:** P0
**Owner:** project
Current `.gitignore` only has the review filename. Add: `.env`, `.env.*`, `*.key`, `*.pem`, `*.p12`, `credentials.*`, `*secret*`, `.sisyphus-token`, `.DS_Store`, `node_modules/`, `dist/`, `build/`.

### T3 -- HIGH: Self-host Google Fonts
**Priority:** P1
**Owner:** project
Download Playfair Display + Lora as woff2, place in `css/fonts/`, replace CDN link with local `@font-face` declarations with `font-display: swap`. Closes GDPR, performance, and SPOF issues simultaneously.

### T4 -- HIGH: Add contact method
**Priority:** P1
**Owner:** project
`index.html:246` says "I'd love to hear from you" with zero contact info. Add a `mailto:` link at minimum.

### T5 -- HIGH: Add at least one photo per horn
**Priority:** P1
**Owner:** Andrea (content)
`images/` is empty. A workshop log about physical craft needs photos. Even phone photos of each horn would transform the site.

### T6 -- MEDIUM: Remove remaining dead CSS + JS
**Priority:** P2
**Owner:** project
- `css/style.css:400,411` -- `grid-template-columns` on `.horn-entry` (not grid, does nothing)
- `js/main.js:17-19` -- `.scrolled` toggle with no corresponding CSS rule
- Consider inlining the remaining 14 useful lines of JS or adding null-guards.

### T7 -- MEDIUM: Add accessibility fixes
**Priority:** P2
**Owner:** project
- `index.html:25` -- add `aria-expanded="false"` and `aria-controls="nav-links"` to `.nav-toggle`
- `css/style.css` -- add `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`
- `index.html:18` -- change `href="#"` to `href="#top"` or `href="./"`

### T8 -- MEDIUM: Add og:image, favicon, schema.org
**Priority:** P2
**Owner:** project
No share card, no favicon, no structured data. Add `og:image` meta, a favicon, and a `schema.org/Person` or `ItemList` JSON-LD block.

### T9 -- LOW: Document repair details for practice log
**Priority:** P3
**Owner:** Andrea (content)
Each repair horn should have: specific diagnosis (which key, which pad, leak-light result), materials used, before/after playing notes. This is the core value proposition of a "workshop log."

### T10 -- LOW: Resolve positioning ambiguity
**Priority:** P3
**Owner:** Andrea (decision)
`index.html:222` says "might turn into a small repair practice." Either commit to the business seed framing (add rates, disclaimers) or drop it and frame purely as learning log. Current ambiguity confuses every other decision (contact info, SEO, content depth).

---

*Review by architect, acting through 7 activated panel roles (PM, UI/UX, Free Jazz Alto Player, Sax Repair Technician, Musicologist, Art Director, Marketing). Remaining 17 roles (SRE, DEV, Solution Architect, Software Architect, System Architect, DBA, Cybersecurity, QA, Performance, Accessibility, SEO, Legal, DevOps, Security Architect, Network Engineer, Technical Writer, Data Engineer) covered in baseline and unchanged -- delta is null for all.*
