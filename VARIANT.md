# v04 · Bento — the site as a dashboard

## Design plan

**Concept.** An MLOps engineer reads the world through a dashboard, so the
page becomes one: a 12-column bento grid of tiles where the important things
are literally bigger, every number already on the page is promoted to a
figure tile that links back to the section it came from, and a monospace
status line sits where a service health panel would.

**Palette.** Dark only, committed to and painted explicitly. Cool near-black
with a blue-grey bias — ground `#0e1116`, tile `#151a21`, hover tile
`#1a2029`, hairline borders `rgba(160,178,204,.13)` brightening to `.32` on
hover. The existing moss `#a8b33e` stays the single accent (links, buttons,
figure sources, section indices). One semantic pair — green `#7ee0a0`, amber
`#e6b455` — appears **only** on status chips ("open to collaboration",
"latest", "on-call 24/7 · 2017–2019"), never on body text or borders. Every
text/background pair is ≥ 6.5:1.

**Type.** Inter for UI text, Inter Tight for headings and figures, JetBrains
Mono for labels, the status line, chips, buttons, section tags and code.
`font-variant-numeric: tabular-nums` on every figure and on the footer line.

**Hero.** A CSS grid, 12 columns, deliberate spans, `grid-auto-flow: row`
(never `dense`): portrait tile (3 wide × 2 rows), thesis tile with the `<h1>`
and the one-line thesis (6 × 2 rows), status tile and "latest → SlideOps"
tile stacked in the right 3 columns, then the figure tiles, then a contact
tile.

**Figures are facts already on the page**, each linking to its source
section: 200 scientists and engineers · 20 GB/s → 200 MB/s · 28 GPUs (NVIDIA
Tesla K40) · £2.3K + £3.8K for Street Child · Europe's largest AI engineering
community · DevOps award 2022 & 2023 · ISO 27001 · marathon 5:31, 100 km
4:44, 160 km + 175 km. Nothing was invented.

**Sections are bentos too.** SlideOps spans all 12 columns as a horizontal
tile; embeds get 6- or 8-wide tiles with aspect boxes; the resources list is
a 4-wide tile spanning two rows so the row below it closes flush; short items
are 4-wide. Uniform 14 px radius, hairline border, 2 px hover lift, brighter
border on hover, one padding scale, one baseline. No two adjacent rows share
a rhythm.

**Responsive.** One column below 640 px, two from 640–1024, the full
12-column grid above. On phones the hero figure tiles become a full-bleed,
snap-scrolling row, so the numbers are skimmable instead of eight more
full-width cards.

**Nav.** Compact sticky bar: logo, name, mono subtitle, and a pill segmented
control of the six section links driven by an IntersectionObserver
scroll-spy. Under 960 px it becomes a right-hand drawer with a backdrop,
outside-tap and Escape to close.

**Icons.** Inline SVG sprite — 33 Font Awesome 6.4.2 glyphs, exactly the set
the page uses, ~19 KB inside the document. No cdnjs request at all.

**Motion.** Minimal. Tile hover lift, drawer slide, and figure tiles that
count up once when they enter the viewport — from markup that already holds
the final value, so a static screenshot always shows the real number. All of
it gated behind `prefers-reduced-motion`.

## What changed and why

- **Layout.** The uniform two-column card grid became a 12-column bento with
  deliberate spans (finding 13: everything used to weigh the same). SlideOps
  is now the widest tile on the page; a 2019 GPU-server post is a quarter of
  a row.
- **A real `<h1>`.** Visible, in the thesis tile (finding 12).
- **Hero copy.** Three centred paragraphs became a left-aligned thesis tile
  with a kicker, the `<h1>`, a one-line thesis and the bio (finding 7).
- **Icons.** Font Awesome from cdnjs (render-blocking CSS plus ~200 KB of
  webfonts for ~30 glyphs) replaced by the inline SVG sprite (finding 2).
- **Fonts.** `preconnect`, `preload as=style`, and a `media="print"` swap
  with a `<noscript>` fallback, so the stylesheet no longer blocks render
  (finding 3). The hero portrait is `preload`ed with `fetchpriority="high"`.
- **Favicon and logo.** `images/icon.png` (489 KB, requested twice) replaced
  by `favicon-32.png` (3.0 KB), `apple-touch-icon.png` (22 KB) and
  `logo-80.webp` (2.2 KB), generated from `main.webp` with Pillow
  (finding 1).
- **Embeds.** All six iframes are `loading="lazy"` and sit in aspect boxes,
  so they no longer sit on the critical path or reserve empty space before
  they paint (findings 4 and 9). This **changes CARRYOVER point 2.**
- **Open Graph / Twitter card** added, pointing at `images/gleb-mlops.png`,
  plus `canonical` and `color-scheme` (findings 6 and 15).
- **Drawer.** A 320 px panel with a backdrop, outside-tap close, Escape and
  48 px tap targets (finding 11). It is `display: none` when closed — with
  `transition-behavior: allow-discrete` for the slide — so the parked panel
  no longer widens the document.
- **Header stacking-context bug.** `backdrop-filter` on the sticky header
  made the header the containing block for the fixed drawer, so the drawer
  was clipped to 60 px and opened as an empty sliver. The frosted pane moved
  to a `::before`, which fixes the drawer and keeps the blur.
- **List markup.** `<b>Career:</b>` inside a `<ul>` became a
  `<p class="list-head">` between two proper lists (finding 14). The plot
  image gained real `alt` text. The copyright year is set by JS with a static
  2026 fallback.
- **Phone section titles.** "Agentic AI Foundation (AAIF) Community London"
  went from three lines to two (finding 8).
- **Tile media.** Photo tiles next to a taller neighbour grow the photo into
  the slack instead of growing their padding; screenshots and plots are
  centred in an elevated panel rather than cropped to an unreadable slice.

## Measured

Own-origin bytes and requests, 1440 × 900, Chromium, third parties blocked.

| | first view | whole page scrolled |
|---|---|---|
| master | 1,383 KB / 6 requests | 2,470 KB / 19 requests |
| v04 | **221 KB / 5 requests** | **1,308 KB / 18 requests** |

−84 % on first view, −47 % over the whole page. On top of that, master pulls
Font Awesome's CSS and webfonts from cdnjs and mounts all six third-party
iframes on first paint; v04 pulls nothing from cdnjs and mounts one iframe
(the only one near the viewport).

`index.html` itself grew 93.0 KB → 145.3 KB. The inline sprite is ~19 KB of
that; the rest is the bento CSS and the extra hero markup. It is still a net
saving of over a megabyte on first view.

Other numbers: page height 8,703 px desktop, 15,871 px phone (master was
~16,600 px on a phone). No horizontal scroll at 360, 390, 640, 768, 1024,
1440 or 1920 px. 16 images, every one with `alt` and intrinsic
`width`/`height`. All six embeds present, all lazy. Lowest contrast pair
6.57:1.

## Deliberately left out

- **The animated network hero background** (`bg.webp`, 269 KB). A dashboard's
  ground should be still; the tiles are the interest. This is the one piece
  of the current site the variant drops on purpose, and it is the single
  biggest item in the first-view saving.
- **A light theme.** The brief allowed committing to dark-only, and the
  elevated-tile system depends on a dark ground; a half-hearted light mode
  would read worse than none.
- **`<picture>` elements.** Bare `<img src="*.webp">` with intrinsic sizes,
  which the shared brief permits; the PNG/JPEG fallbacks are dead weight in
  2026 and this design needs no extra markup for them.
- **Deleting `assets/`, `images/icon.png` and the PNG fallbacks.** That
  clean-up belongs to v01; this branch changes only what its design needs.
- **Scroll-reveal animation.** Nothing on this page is ever parked at
  `opacity: 0`; the whole thing reads in a static screenshot.
