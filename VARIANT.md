# v01 · Tune-up

The same site, rebuilt underneath: identical pixels on desktop, a third of the
bytes, and markup a screen reader and a link preview can actually use.
Everything here is the kind of change you merge on a Tuesday without a design
review — no new look, no new layout, no new dependencies.

## What changed and why

### Performance

- **489 KB favicon → 27 KB of real icons.** `images/icon.png` (489,770 bytes,
  the same pixels as `main.png`) served as both the favicon and the 40 px
  header logo. Replaced with `favicon-32.png` (2,505 B), `apple-touch-icon.png`
  (22,026 B, 180 px) and `logo-80.webp` (1,842 B, the header mark at 2×),
  all generated from `images/main.webp` with Pillow.
- **Font Awesome CDN → inline SVG sprite.** The page used 32 distinct glyphs
  in 49 places and paid 102 KB of render-blocking CSS plus 260 KB of woff2 for
  them. Those 32 glyphs now ship as a `<symbol>` sprite at the top of `<body>`
  (18 KB raw, ~5 KB of the gzipped page) referenced by `<use href="#i-…">`.
  Paths are verbatim Font Awesome Free 6.4.2 (CC BY 4.0, attribution comment
  above the sprite) — every one verified byte-identical against the upstream
  SVGs. One fewer external host on the critical path.
- **Non-blocking Google Fonts.** `preconnect` + `preload as=style` +
  `media="print" onload="this.media='all'"`, with a `<noscript>` fallback.
  Inter and JetBrains Mono fall back to the system stacks until they arrive,
  so first paint no longer waits on fonts.googleapis.com.
- **Hero preload.** `<link rel="preload" as="image">` for `main.webp` and
  `fetchpriority="high"` on the `<img>`; the LCP element starts loading from
  the preload scanner instead of after CSS.
- **All six embeds lazy.** The four YouTube, the Spotify and the LinkedIn
  iframes now carry `loading="lazy"`. They still embed live (owner's choice)
  and still reserve their space — they just leave the critical path.
- **`color-scheme: dark`** on `:root` plus the matching meta, so scrollbars
  and form controls are dark before any CSS applies.

### Repo hygiene

- **Deleted the HTML5 UP "Prologue" template** (`assets/`, 2.93 MB of SASS,
  jQuery, the Font Awesome webfonts and `main.css`) — nothing referenced it.
- **Deleted the PNG/JPEG fallbacks** behind every `<picture>` and the 670 KB
  `bg.gif` (8.40 MB in total). Each `<picture>` became a plain
  `<img src="….webp">` keeping its `loading`, `decoding`, intrinsic
  `width`/`height` and `alt`; the hero background is now a plain
  `url("./images/bg.webp")`. WebP has been universally supported since 2020.
- **11.33 MB removed from the clone** (49 files). `files/` (the PDFs) is
  untouched.

### Structure and semantics

- A real `<h1>` ("Gleb Lukicov — MLOps Leader | PhD in Physics"), visually
  hidden because the design has no place for one.
- `alt` on the A_Bz plot (the one image that had none).
- Valid list markup: `<b>Technical</b>:` and `<b>Career:</b>` moved out of the
  `<ul>` into a `<p class="list-label">`; the hand-positioned inline styles on
  every `<li>` bullet replaced by an `.icon-list` / `.li-icon` rule pair.
- Copyright year set from `new Date().getFullYear()`, with the static 2025 kept
  in the markup as the no-JS fallback.
- Open Graph + Twitter card meta (`og:title/description/image/url/type`,
  `og:image:width/height/alt`, `twitter:card=summary_large_image`,
  `twitter:creator`) pointing at a new 1200×630 `images/og-image.jpg` cut from
  the existing AAIF meetup photo, plus a `<link rel="canonical">`.

### Phone (≤600 px)

- Hero paragraphs left-aligned. Three centred 40-line paragraphs were the
  single worst thing about the page on a phone.
- Section titles fluid: `clamp(1.15rem, 5vw, 1.5rem)` with `text-wrap:
  balance`. "Agentic AI Foundation (AAIF) Community London" now holds two
  lines with its trailing icon at every width from 360 px up, instead of
  three. Nothing changes above 480 px.
- Card button groups (`.card-actions`) wrap as a flex row instead of stacking:
  SlideOps' three buttons and the MLOps card's two now sit side by side.
- Nav drawer gets a backdrop that closes it on tap, plus `overflow: hidden` on
  `body` while it is open. Escape and link clicks already closed it.
- Embed cards get a neutral `--card-hover` surface and a 200 px floor, so a
  slow or blocked third party reads as a card that has not loaded yet rather
  than a hole in the page.
- 40 px minimum tap target on `.card-link` and the two drawer buttons, up to
  768 px.

## Measured

Page weight and request count for `index.html` and its own assets. Third-party
iframe *contents* are excluded; the CSS and fonts the page itself requests are
included. Text assets counted gzipped (what GitHub Pages and both CDNs serve),
binaries at their real transfer size. Modern browser, so the `<picture>`
PNG/JPEG fallbacks were never fetched and are not counted on the "before" side
either.

### Whole page (everything, including lazy images once scrolled)

| | Before | After |
|---|---|---|
| `index.html` (gzip) | 14,672 | 22,965 |
| Font Awesome CSS (gzip) | 21,667 | — |
| Font Awesome woff2 (solid + brands) | 259,828 | — |
| Google Fonts CSS (gzip) | 831 | 831 |
| Google Fonts woff2 (4 latin subsets) | 165,936 | 165,936 |
| Favicon / header logo | 489,770 | 4,347 |
| WebP images (16) | 1,454,280 | 1,454,280 |
| **Total** | **2,406,984 B (2.30 MiB)** | **1,648,359 B (1.57 MiB)** |
| **Requests** | **26** | **24** |

**−758,625 bytes (−31.5 %), −2 requests.**

### Initial load (above the fold, before any scrolling)

| | Before | After |
|---|---|---|
| `index.html` (gzip) | 14,672 | 22,965 |
| Font Awesome CSS + woff2 | 281,495 | — |
| Google Fonts CSS + woff2 | 166,767 | 166,767 |
| Favicon + header logo | 489,770 | 4,347 |
| Hero portrait + hero background | 297,654 | 297,654 |
| **Total** | **1,250,358 B (1.19 MiB)** | **491,733 B (480 KiB)** |
| **Requests** | **8** | **7** |
| **Eager third-party iframes** | **6** | **0** |

**−758,625 bytes (−60.7 %) before the fold.**

Render-blocking bytes drop from 37,170 across three requests to two hosts
(`index.html` + Font Awesome CSS + Google Fonts CSS) to 22,965 in one request
to one host.

### Repository

11.33 MB deleted across 49 files: `assets/` 2.93 MB, image fallbacks 8.40 MB.
`index.html` grows 95,208 → 115,952 bytes raw (14,672 → 22,965 gzipped); the
sprite is 18,391 of those raw bytes and buys back 281 KB of network.

### Rendered

Desktop full-page height is 12,343 px before and after — the same layout to the
pixel. The only differences at 1440 px are the header logo (an 80 px asset
resampled to 40 px instead of a 512 px one) and the footer year. Mobile height
drops 17,053 → 16,794 px from the tighter section titles. No horizontal scroll
at 360, 390 or 1440 px; every nav, social and card control is ≥40 px tall at
phone widths.

## Deliberately left out

- **No facades for the embeds.** CARRYOVER.md records eager embeds as the
  owner's choice; `loading="lazy"` keeps them live and click-free while taking
  them off the critical path. Replacing them with poster images is a product
  decision, not a tune-up.
- **No preload for `bg.webp`.** The 269 KB hero animation is the largest
  remaining asset, but it is decoration behind a near-black gradient;
  promoting it would compete with the portrait for bandwidth. Shrinking or
  dropping it is a design call for another variant.
- **No self-hosted fonts.** The brief allows fonts.googleapis.com, and
  self-hosting would add ~166 KB to the repo for a second-visit win only.
- **No light theme, no layout changes, no motion.** Tier 2 and 3 variants own
  those. The phone page is still ~16,800 px of full-width cards — that is
  finding 10, and fixing it means changing the design.
- **`text-wrap: balance`** is a progressive enhancement; browsers without it
  get the `clamp()` size and the same two lines.
