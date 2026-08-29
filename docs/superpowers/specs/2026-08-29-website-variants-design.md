# Website variants design — 2026-08-29

## Goal
Produce 22 fully implemented variants of glukicov.github.io that the owner can view side by side, then cherry-pick from into a final site. Primary audience: hiring managers / recruiters. Primary CTA: LinkedIn; secondary: CV.

## Inputs
- Current site: single `index.html` (~1,900 lines, inline CSS/JS), 17 images (several 500–900 KB), unused legacy `assets/` from HTML5UP template, `bg.gif` animated background, six third-party iframes (YouTube ×4, Spotify, LinkedIn).
- Design reference: owner's Refactoring UI notes (grayscale-first, hierarchy via size/spacing/colour not weight, ≥25% spacing steps, 16px base + modular scale, 45–75 ch measure, HSL palettes with fixed extremes, dark-on-light for contrast, light-from-above shadows, dark overlays for text on images, spacing over borders, mobile-first).
- Scope: visual + copy + structure changes all allowed. Roughly half the variants may use a build step.

## Hosting decision
Stay on GitHub Pages. Switch from legacy branch-serving to GitHub Actions deploy so built output can be published to the same URL. Every build-step variant ships `.github/workflows/deploy.yml`. Move to Cloudflare Pages only if edge image resizing, functions, forms or first-party analytics become needed.

## Comparison harness
- Branch per variant `variant/NN-slug`, checked out in worktree `../glukicov-variants/NN-slug/`.
- `hub/` (branch `variant/hub`): `serve-all.sh` serves variant NN on port `88NN` (Python http.server for static; `astro preview` for built). `index.html` on 8800 lists variants with screenshot thumbnails, rationale, and a compare mode (2–4 iframes, synced scroll, desktop/390px toggle).
- `shoot.py` (Playwright) captures desktop + mobile screenshots per variant into `hub/shots/`.
- Each variant has `VARIANT.md`: what changed, principle exercised, keep/drop recommendation.

## Variants
Tier A — single static file, exactly one principle each, everything else unchanged:
01 grayscale-hierarchy · 02 type-scale · 03 spacing-system · 04 hsl-palette · 05 hero-recruiter · 06 depth · 07 images (aspect ratios, overlays, WebP, lazy, bg.gif→CSS) · 08 light-theme · 09 content-edit (reorder, tighten copy, archive weak items, add experience timeline) · 10 nav-footer (slim sticky nav, scroll-spy fix, skip link, contact footer) · 11 a11y-perf (focus, reduced-motion, alt, iframe facades) · 12 mobile-first.

Tier B — combined static redesigns, no build step:
13 olive-refined (all Tier A applied) · 14 editorial-light · 15 dark-minimal · 16 bento.

Tier C — Astro, static output, Actions deploy:
17 astro-baseline (1:1 port, components, content files, image pipeline) · 18 astro-recruiter (impact numbers, timeline, /cv) · 19 astro-multipage (/writing from Medium RSS at build, /talks, /projects, /research) · 20 astro-tailwind-editorial · 21 astro-dark-motion (view transitions, scroll-reveal, reduced-motion) · 22 astro-cv-source (site + printable CV from resume.json).

## Rules for every variant
- All existing links, images and embeds preserved unless the variant's brief says otherwise.
- Google Analytics tag and site-verification meta retained.
- Works at 390px and 1440px; no horizontal scroll.
- Build-step variants: `npm run build` succeeds, output in `dist/`, deploy workflow present.
- No changes to `master`.

## Verification
- Hub screenshots for every variant; owner reviews in Chrome.
- Tier C: build passes; Tier A/B: HTML validates (no unclosed tags) and console has no errors.
