# Website Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 22 side-by-side variants of glukicov.github.io plus a comparison hub, each on its own branch/worktree, so the owner can cherry-pick a final design.

**Architecture:** One git worktree per variant under `../glukicov-variants/NN-slug` on branch `variant/NN-slug`, all forked from `master`. Tier A/B variants edit the single `index.html`; Tier C variants replace it with an Astro project whose static `dist/` is deployed by GitHub Actions. A `hub/` worktree serves everything on ports 88NN and renders a comparison page on 8800.

**Tech Stack:** Static HTML/CSS/JS; Astro 5 (Tier C); Tailwind 4 (variant 20); Python 3 http.server; Playwright (Python, via `uv run`) for screenshots.

**Spec:** `docs/superpowers/specs/2026-08-29-website-variants-design.md`

## Global Constraints

- Primary audience: hiring managers / recruiters. Primary CTA LinkedIn (`https://www.linkedin.com/in/glukicov`), secondary CV (`files/PhDThesis_Gleb_Lukicov.pdf` stands in until a CV PDF exists; label it "CV" only in variants 18 and 22 which generate one).
- Every variant keeps: GA tag `G-JZQT6ZZKQV`, `google-site-verification` meta, `images/icon.png` favicon, all outbound links from current `index.html`.
- Works at 390px and 1440px viewports with no horizontal scroll.
- Tier A variants change ONE thing only; everything not in the brief stays byte-identical where possible.
- Tier C: `npm run build` succeeds; output in `dist/`; `.github/workflows/deploy.yml` present; `astro.config.mjs` has `site: 'https://glukicov.github.io'`.
- Never commit to `master`. Each variant commits on its own branch with message `variant NN: <slug>`.
- Every variant has `VARIANT.md` (≤ 200 words): **What changed**, **Principle**, **Keep/drop recommendation**.
- Use Node 22 (present), `uv` for Python.

---

## Worktree contract (used by every variant task)

```bash
# from /Users/gleb/software/glukicov.github.io
NN=05; SLUG=hero-recruiter
git worktree add -b variant/$NN-$SLUG ../glukicov-variants/$NN-$SLUG master
cd ../glukicov-variants/$NN-$SLUG
# ...edit...
git add -A && git commit -m "variant $NN: $SLUG"
```

Static verification (Tier A/B):
```bash
uv run --with html5lib python -c "import html5lib,sys;html5lib.HTMLParser(strict=True).parse(open('index.html','rb'))" && echo VALID
python3 -m http.server 88$NN   # background; then screenshot via hub/shoot.py
```

Astro verification (Tier C):
```bash
npm ci && npm run build && test -f dist/index.html && echo BUILD_OK
```

---

### Task 0: Hub, serve-all, screenshots

**Files:**
- Create: `../glukicov-variants/hub/serve-all.sh`, `../glukicov-variants/hub/index.html`, `../glukicov-variants/hub/shoot.py`, `../glukicov-variants/hub/variants.json`
- Worktree: `git worktree add -b variant/hub ../glukicov-variants/hub master` then `git rm -r --cached . && rm -rf index.html images files assets contact.html googledb*.html LICENSE.txt` (hub branch holds only `hub/` files at repo root).

**Interfaces:**
- Produces: `variants.json` — array of `{"nn":"05","slug":"hero-recruiter","tier":"A","port":8805,"kind":"static"|"astro","title":"...","blurb":"..."}`; `serve-all.sh` reads it; `shoot.py` writes `shots/NN-desktop.png` and `shots/NN-mobile.png`; `index.html` reads both.

- [ ] **Step 1: variants.json** — all 22 entries from the spec, `kind:"astro"` for 17–22, `port = 8800 + nn`.

- [ ] **Step 2: serve-all.sh**
```bash
#!/usr/bin/env bash
# Serves hub on 8800 and each variant on 88NN. Ctrl-C stops all.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(dirname "$HERE")"
pids=()
(cd "$HERE" && python3 -m http.server 8800 >/dev/null 2>&1) & pids+=($!)
python3 - "$HERE/variants.json" <<'PY' | while read -r nn slug kind port; do
import json,sys; [print(v["nn"],v["slug"],v["kind"],v["port"]) for v in json.load(open(sys.argv[1]))]
PY
  d="$ROOT/$nn-$slug"; [ -d "$d" ] || { echo "skip $nn ($d missing)"; continue; }
  if [ "$kind" = astro ]; then
    (cd "$d" && [ -d dist ] || npm run build >/dev/null 2>&1; cd dist && python3 -m http.server "$port" >/dev/null 2>&1) & pids+=($!)
  else
    (cd "$d" && python3 -m http.server "$port" >/dev/null 2>&1) & pids+=($!)
  fi
  echo "$nn $slug -> http://localhost:$port"
done
echo "hub -> http://localhost:8800"
trap 'kill "${pids[@]}" 2>/dev/null' INT TERM; wait
```
Note: astro variants are served from `dist/` with plain http.server so no Node process is needed at view time.

- [ ] **Step 3: shoot.py** (run with `uv run --with playwright python shoot.py`; first run `uv run --with playwright playwright install chromium`)
```python
import json, pathlib, sys
from playwright.sync_api import sync_playwright
here = pathlib.Path(__file__).parent
shots = here / "shots"; shots.mkdir(exist_ok=True)
variants = json.loads((here / "variants.json").read_text())
only = set(sys.argv[1:])
with sync_playwright() as p:
    b = p.chromium.launch()
    for v in variants:
        if only and v["nn"] not in only: continue
        for name, w, h in (("desktop", 1440, 900), ("mobile", 390, 844)):
            pg = b.new_page(viewport={"width": w, "height": h})
            try:
                pg.goto(f"http://localhost:{v['port']}/", wait_until="networkidle", timeout=20000)
            except Exception as e:
                print("WARN", v["nn"], name, e); pg.close(); continue
            pg.screenshot(path=shots / f"{v['nn']}-{name}.png", full_page=True)
            pg.close(); print("ok", v["nn"], name)
    b.close()
```

- [ ] **Step 4: index.html** — vanilla HTML/CSS/JS, dark neutral UI. Fetches `variants.json`. Grid of cards: thumbnail (`shots/NN-desktop.png`, `object-fit: cover; object-position: top`), title, tier badge, blurb, "Open" link to port, checkbox "Compare". Toolbar: "Compare selected (2–4)", viewport toggle Desktop/Mobile (iframe width 100% vs 390px). Compare view: flex row of iframes, each `src=http://localhost:PORT/`; synced scroll via `postMessage` is not possible cross-origin, so instead sync by scroll *fraction* using a small script injected by each variant? No — keep it simple: scroll sync is off; give each iframe `height: 90vh` with its own scrollbar. Also link `VARIANT.md` rendered inline by fetching `http://localhost:PORT/VARIANT.md` and showing raw text in a `<details>`.

- [ ] **Step 5: verify** — `bash serve-all.sh` prints hub URL; open http://localhost:8800 in Chrome; commit `hub: comparison harness`.

---

### Tier A variants (Tasks 1–12)

Each task: create worktree per contract, apply ONLY the brief, validate HTML, write `VARIANT.md`, commit. Base file is `index.html` from `master` (CSS in `<style>` lines 46–749, markup 751–1878, JS 1881–1940).

### Task 1: `01-grayscale-hierarchy`
- Replace every colour in `:root` and hard-coded hex (`#ab5249`, `#6d7221`, olive gradients) with a neutral scale: bg `#111214`, card `#1b1c1f`, border `#2a2c30`, text `#ececec`, muted `#a3a7ad`, accent = `#ececec` (no hue). Remove `background-image: url(./images/bg.gif)` on `.hero` and `.footer`; remove the `.section::before` gradient overlays.
- Establish hierarchy purely by size/weight/spacing: `h2.section-title` 2rem/700, `h3.card-title` 1.125rem/600, `.card-text` 1rem/400 muted, links underlined on hover only.
- Everything else untouched.
- VARIANT.md principle: "design in grayscale first; colour is added later only to enhance".

### Task 2: `02-type-scale`
- `html { font-size: 16px }`; replace Roboto Google font link with system stack `-apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif` (drop the fonts.googleapis link).
- Modular scale (1.25): `--fs-1:0.8rem; --fs0:1rem; --fs1:1.25rem; --fs2:1.563rem; --fs3:1.953rem; --fs4:2.441rem`. Map: h1→fs4, h2→fs3, h3→fs1, card-title→fs1, card-text→fs0, small/subtitles→fs-1.
- `line-height: 1.5` body; headings 1.2. `.hero-text, .card-text { max-width: 65ch }`. Left-align `.hero-text` (multi-line body text should not be centred).
- Keep all colours.

### Task 3: `03-spacing-system`
- Replace spacing tokens with an 8-based scale with ≥25% steps: `--s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:64px; --s9:96px; --s10:128px`. Section padding `--s9` top/bottom (desktop), `--s7` mobile; grid gap `--s6`; card padding `--s5`; card title→text gap `--s2`; text→button gap `--s4`.
- Remove `.card` box-shadow and hover lift; separate cards by spacing alone (`gap`), keep only a 1px `rgba(255,255,255,.06)` border.
- Nothing else.

### Task 4: `04-hsl-palette`
- Define olive palette in HSL, hue 63: `--olive-950:hsl(63 55% 8%) … --olive-50:hsl(63 40% 96%)` with 10 steps (950,900,800,700,600,500,400,300,200,100,50). Neutral greys with a hint of the same hue: `--gray-900:hsl(63 6% 12%)` … `--gray-100:hsl(63 6% 92%)`.
- Text: `--text: var(--gray-100)`, `--text-muted: hsl(63 6% 70%)`. Buttons flip to dark-on-light: `.card-link { background: var(--olive-300); color: var(--olive-950) }`. Nav active state `--olive-400` bg + `--olive-950` text (no more `#ab5249` red).
- Hover link colour `--olive-300` (drop the red). Header bg `--olive-800`. Section gradients recoloured to palette. Check every text/background pair ≥ 4.5:1 (use `uv run --with wcag-contrast-ratio` or compute manually).

### Task 5: `05-hero-recruiter`
- Replace the `.hero` content: `<h1>Gleb Lukicov</h1>`, `<p class="hero-role">MLOps Leader · PhD in Physics · London</p>`, one-line value prop: "I build the platforms and teams that get data science into production." Then a 3-item proof row (`<ul class="proof">`): "Co-organiser, MLOps Community London — Europe's largest MLOps meetup", "Google Cloud DevOps Award, 2022 & 2023 (Virgin Media O2)", "Muon g−2 collaboration — 2026 Breakthrough Prize in Fundamental Physics".
- CTAs: primary `<a class="btn btn-primary" href="https://www.linkedin.com/in/glukicov">Connect on LinkedIn</a>`; secondary `<a class="btn btn-secondary" href="https://github.com/glukicov">GitHub</a>`; tertiary text links Medium, X. Delete the pulsing `.hero-social-link` animation.
- Move the current 3-paragraph bio into a new `#about` card at the top of the MLOps section (unchanged text).
- Photo stays, 120px.

### Task 6: `06-depth`
- Shadow scale: `--shadow-sm: 0 1px 2px rgba(0,0,0,.4); --shadow-md: 0 4px 6px -1px rgba(0,0,0,.45), 0 2px 4px -2px rgba(0,0,0,.4); --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.5), 0 4px 6px -4px rgba(0,0,0,.4)`. Cards `--shadow-md`; header `--shadow-sm`; buttons inset top highlight `box-shadow: inset 0 1px 0 rgba(255,255,255,.12)`.
- Hero image overlaps into the first section: `.hero-img { margin-bottom: -60px; position: relative; z-index: 4 }` with the first section getting `padding-top: 100px`.
- Remove `transform: translateY(-5px)` hover on cards; hover only raises shadow to `--shadow-lg`.

### Task 7: `07-images`
- Convert every PNG/JPEG in `images/` to WebP (`uv run --with pillow python - <<'PY' … PY` loop; quality 82; keep originals) and use `<picture>` with WebP first. Add `loading="lazy" decoding="async"` and explicit `width`/`height` on all `<img>` below the fold.
- All card images: `aspect-ratio: 16/9; object-fit: cover` so grid rows align.
- Replace `bg.gif` on hero/footer with a CSS radial + linear gradient in the olive hue (no image). Hero text gets `text-shadow: 0 1px 2px rgba(0,0,0,.5)` on top of a darker overlay `rgba(20,22,24,.55)`.

### Task 8: `08-light-theme`
- Flip the theme: `--bg: #f7f7f3; --card-bg: #ffffff; --text: #1f2320; --text-muted: #5b615c`; header `#f7f7f3` with 1px bottom border; nav text `#1f2320`; accent stays olive `#6d7221` for buttons (white text on `#5a5f1c` passes 4.5:1 — verify) and link colour `#5a5f1c`. Section gradient overlays removed; hero gets a pale olive tint `hsl(63 40% 94%)`. Card shadow `0 1px 3px rgba(0,0,0,.08)`. `bg.gif` removed.

### Task 9: `09-content-edit`
- New section order: About (hero) → Impact (new: 3 stat tiles: "3,000+ community members", "2× DevOps Award", "Breakthrough Prize 2026" — mark numbers the owner must confirm with `<!-- CONFIRM -->`) → Experience (new timeline: Electric Twin — Head of ML Platform (dates TBC), Virgin Media O2 — ML Engineering Manager, UCL/Fermilab — PhD; each with one bullet) → MLOps Community → Writing & talks (SlideOps, two Medium articles, RSS interview, podcast, VMO2 video, Inspired to Build) → Research (unchanged) → Archive (compact `<ul>`: GPU server article, Bitcoin/Electrum article, ISO 27001 post) → Interests (both cycling cards merged into one) → footer.
- Tighten copy: hero bio to 60 words; every card text ≤ 45 words; remove "In this video/interview/podcast, I…" openers.
- Fix nav: labels match section titles (`Outreach`→`Education`).

### Task 10: `10-nav-footer`
- Header height 56px, no logo subtitle; nav links text-only (drop icons); active state = 2px underline in `#a2ad2e`, not a filled red box.
- Fix scroll-spy: use `IntersectionObserver` with `rootMargin: "-40% 0px -55% 0px"` instead of the offsetTop loop.
- Add `<a class="skip-link" href="#about">Skip to content</a>` visually hidden until focused.
- Footer: 3 columns — contact (LinkedIn, GitHub, Medium, X, email link `mailto:` omitted unless owner supplies), "Sections" list, "Made in London · © 2026". Section IDs unchanged.

### Task 11: `11-a11y-perf`
- Replace all six `<iframe>`s with click-to-load facades: a `<button class="facade" data-src="…" aria-label="Play: <title>">` containing a static thumbnail (`https://i.ytimg.com/vi/<id>/hqdefault.jpg` for YouTube; for Spotify/LinkedIn use a styled card with logo text) that swaps to the iframe on click.
- `:focus-visible { outline: 3px solid #a2ad2e; outline-offset: 2px }`; `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } html { scroll-behavior: auto } }`.
- Meaningful `alt` on every image (write them); `plot.png` gets `alt="Muon precession frequency fit"`; decorative → `alt=""`.
- Buttons in the mobile menu get `aria-expanded`/`aria-controls`.

### Task 12: `12-mobile-first`
- Rewrite all media queries mobile-first (`min-width` only): base styles are the 390px layout; `@media (min-width: 768px)` adds 2-col grid; `@media (min-width: 1024px)` adds full nav.
- Mobile type scale compressed: h1 1.75rem, h2 1.5rem, h3 1.125rem; desktop restores current sizes.
- Drawer nav slides from bottom (`transform: translateY(100%)`→`0`) with backdrop; tap targets ≥ 44px.

---

### Tier B variants (Tasks 13–16) — full static redesigns

Each may restructure freely but must remain a single `index.html` + `images/`. Reuse the copy edits from Task 9 (copy the section text from that worktree once it exists — read `../glukicov-variants/09-content-edit/index.html`).

### Task 13: `13-olive-refined`
- Apply the changes from Tasks 2, 3, 4, 5, 6, 7, 9, 10, 11, 12 together on the olive identity. Resolve conflicts in favour of the later task number. Result: current brand, professionally executed.

### Task 14: `14-editorial-light`
- Light ground `#fbfaf6`, ink `#141414`. Display serif from Google Fonts `Fraunces` (weights 600/700) for h1/h2, body `Inter` 400/500. 12-column max-width 1100px with a 3/9 split: sticky left column = name, role, nav, contact links; right column = content flowing in long-form sections with generous rules (`border-top: 1px solid #e4e2da`) instead of cards. Images full-bleed within the column, captions in small italic. Olive appears only as link underline colour.

### Task 15: `15-dark-minimal`
- `#0b0c0e` ground, `#e6e6e6` text, single accent `#c8d64b`. No cards, no images in lists: home is a single column max 680px — hero (name, role, 2-sentence intro, LinkedIn/GitHub/Medium links), "Selected work" as a list (title, one line, year, link), "Writing", "Talks", "Research", "Community" each as terse lists. Two images only: portrait and the Breakthrough Prize video facade. Monospace `JetBrains Mono` for meta (years, tags).

### Task 16: `16-bento`
- CSS grid bento (desktop 4 cols, tiles spanning 1–2 cols/rows; mobile 1 col). Tiles: portrait+intro (2×2), LinkedIn CTA (1×1), MLOps Community with photo (2×1), Breakthrough Prize video facade (2×1), SlideOps (1×2), two article tiles (1×1), DevOps award (1×1), RSS interview (1×1), stats tile (1×1), cycling (1×1), research links (1×1). Dark ground, cards `#1a1c1f` radius 20px, hover raises shadow only. Nav becomes a small pill bar.

---

### Tier C variants (Tasks 17–22) — Astro

Common scaffold for each (do in the worktree; delete `index.html`, `assets/`, `contact.html` first; keep `images/`, `files/`, `googledb*.html` in `public/`):
```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
npm install
mkdir -p public && git mv images files googledb07a3684e72daa9.html public/ 2>/dev/null || true
```
`astro.config.mjs`: `export default defineConfig({ site: 'https://glukicov.github.io' })`.
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on: { push: { branches: [master] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
`src/layouts/Base.astro` holds `<head>` (GA tag, verification meta, favicon, title, description). Content lives in `src/content/` (JSON/Markdown) — never hard-code project lists in components. Images via `astro:assets` `<Image>` from `src/assets/` (move images there, except favicon which stays in `public/`).

### Task 17: `17-astro-baseline`
- 1:1 visual port of current `index.html`. Components: `Header.astro`, `Hero.astro`, `Section.astro`, `Card.astro`, `Embed.astro`, `Footer.astro`. Content: `src/content/projects.json` (SlideOps + 8 cards), `research.json`, `education.json`, `interests.json`, `resources.json`. Global CSS in `src/styles/global.css` copied from current `<style>`. Mobile-menu JS in a `<script>` in `Header.astro`.

### Task 18: `18-astro-recruiter`
- Built on Task 17's scaffold with the Task 5 hero, Task 9 IA (Impact tiles, Experience timeline from `src/content/experience.json`), Task 4 palette, Task 11 facades. Adds `/cv` page rendered from `experience.json` + `education.json` with a print stylesheet (`@media print`: hide nav/footer, A4 margins).

### Task 19: `19-astro-multipage`
- Pages: `/` (short landing: hero + 3 latest items from each area), `/writing` (built at build time from Medium RSS `https://medium.com/feed/@lukicov` via `fetch` in the frontmatter, parsed with `fast-xml-parser`; fall back to `src/content/writing.json` if fetch fails), `/talks`, `/projects`, `/research`, `/community`. Shared header nav with current-page highlighting via `Astro.url.pathname`.

### Task 20: `20-astro-tailwind-editorial`
- `npx astro add tailwind` (Tailwind v4 via Vite plugin). Theme tokens in `src/styles/global.css` `@theme { --color-olive-50 … --color-olive-950; --font-display: "Fraunces"; --font-sans: "Inter" }`. Implements the Task 14 editorial layout using Tailwind utilities only (no custom CSS beyond `@theme` and font imports).

### Task 21: `21-astro-dark-motion`
- Dark theme (Task 15 palette), `<ClientRouter />` view transitions between `/`, `/writing`, `/research`. Scroll-reveal via a 20-line IntersectionObserver script adding `.in` to `[data-reveal]`; CSS transitions gated by `@media (prefers-reduced-motion: no-preference)`. Header blurs on scroll (`backdrop-filter`).

### Task 22: `22-astro-cv-source`
- `src/content/resume.json` following the JSON Resume schema (basics, work, education, publications, awards, skills, volunteer). Both `/` and `/cv` render from it. `/cv` has a "Download PDF" button that triggers `window.print()`; `@media print` layout fits two A4 pages. Home sections are generated from `work`, `publications`, `awards`, `volunteer` (MLOps community), `projects`.

---

### Task 23: Screenshots + hub check
- Start `bash ../glukicov-variants/hub/serve-all.sh`; run `uv run --with playwright python ../glukicov-variants/hub/shoot.py`; open hub in Chrome; verify every card has a thumbnail; fix any variant that failed to serve.
