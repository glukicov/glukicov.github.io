# v05 · Timeline

**Concept.** The content is already a career arc — a physics festival in 2010,
Fermilab, a PhD, two DevOps awards, a startup, Europe's largest AI meetup, a
Breakthrough Prize — so the page becomes one: a short hero, then a single
vertical timeline down the whole page with a moss spine that fills as you read.
Every card becomes a dated entry that opens on demand, which turns the
16,604 px phone scroll into 7,578 px you can actually skim.

## The design plan

**Direction: newest first.** A recruiter or a conference organiser landing here
wants "what is he doing now" in the first screen, not "what did he do at
sixth-form college". So the spine runs 2026 → 2010: SlideOps and the
Breakthrough Prize first, Your Universe last. The cost is that the arc reads
backwards; the mitigation is that each chapter is self-contained and the year
marker is the largest thing in it, so the direction is never ambiguous. The
timeline head says "newest first" in as many words.

**Chapters.** Ten, ordered newest-first, using only dates already on the page:

| Marker | Chapter | Entries |
| --- | --- | --- |
| 2026 | Now | SlideOps · Breakthrough Prize |
| Community | MLOps Community London → AAIF Community London | co-hosting · LinkedIn post |
| Writing | Articles, talks and interviews | 5 Medium/TDS/RSS pieces |
| Industry | Electric Twin | ISO 27001 · podcast · Inspired to Build |
| 2022–23 | Virgin Media O2 | DevOps journey |
| 2017–19 | Fermilab Muon g − 2 | DAQ on-call · APS Boston 2019 · calibration · EDM · thesis · public tour |
| Yearly | Woodhouse College | alumni talk |
| 2010–15 | Your Universe festival, UCL | spectroscopy for 300 pupils a year |
| Off the clock | Charity rides and a marathon | marathon + 100 km · Netherlands tour |
| Reading | Reading list | books, newsletter, podcast |

Four chapters carry a word rather than a year because the page gives no date
for them (the community role, the writing, Electric Twin, the reading list).
Nothing was invented to fill a marker.

**The spine.** The current hero's network-graph motif, straightened into one
line. An SVG `<line>` runs the full height of the timeline (centre column on
desktop, left rail under 768 px); a second `<line>` on top of it carries
`pathLength="1"` and `stroke-dasharray: 1`, and a `requestAnimationFrame`
handler sets `stroke-dashoffset` from the timeline's position against a reading
line at 45 % of the viewport. Entry nodes and chapter rings light up as they
cross that line. Under `prefers-reduced-motion` the dash is removed entirely and
every node gets `.lit` on load, so the spine is static and fully drawn — and
with no JS at all the CSS defaults already draw it lit.

*One trap worth recording:* `vector-effect: non-scaling-stroke` on that line
makes Chrome ignore `pathLength`, so `stroke-dasharray: 1` becomes a 1-user-unit
dash repeated down the whole spine — a dashed line instead of a progress fill.
The viewBox is 2 units wide in a 2 px box, so the horizontal scale is already 1
and `non-scaling-stroke` buys nothing; it is gone, and the caps are butt because
a round cap would be scaled by the vertical factor and overshoot by ~75 px.

**Entries.** Every card is a `<details>`: a mono date, a title, a one-line
lede, and a ± control on the right. Featured entries (SlideOps, Breakthrough
Prize, AAIF, Virgin Media O2, DAQ) ship `open` in the HTML and an inline script
at the end of `<main>` strips `open` on phones before first paint. Expand all /
Collapse all sit in the timeline head, and a deep link (`#slideops`,
`#gpu-server`, …) opens its own entry on `hashchange` and on load.

**Palette and type.** The noir + moss identity is kept — it is the owner's, and
it earns its keep against a page of physics photographs — but a warmer
secondary neutral is added so the spine and its cards separate from the ground:
the timeline band sits on `--ink-2 #121210`, entries on `--surface #1a1814`
(warm charcoal, not blue-grey), and the spine track gets its own
`--spine-track rgba(236,226,200,.3)` rather than borrowing the hairline colour,
because a 2 px line at hairline alpha disappears. Display type is **Fraunces**
(600, with an italic for the thesis line) for the name, years and chapter
titles — a variable serif with real character where Inter would be anonymous.
Inter stays for body, JetBrains Mono for dates, labels and buttons.

**Nav.** The six links become seven chapter jumps (About / Now / Community /
Industry / Research / Outreach / Interests). The existing IntersectionObserver
scroll-spy is kept and extended: chapters carry `data-nav`, so Writing maps to
Community and Reading to Interests, and the current chapter's year turns moss.
In the drawer each link gets a mono sub-label.

## Changes

- Rebuilt the five card sections as one timeline of 10 chapters / 24 entries.
  All copy, links, `alt` text and the six embeds are carried over verbatim.
- `<details>`/`<summary>` entries with date + title + lede; ± toggle;
  Expand all / Collapse all; hash deep links open their entry.
- SVG spine with scroll-driven `stroke-dashoffset` on `requestAnimationFrame`,
  static under reduced motion. Sticky chapter markers on both breakpoints.
- Hero: portrait, real `<h1>`, one-line thesis, the three intro paragraphs
  left-aligned at 62 ch (they were centred), contact line, social links.
- Icons: **inline SVG sprite** of the 32 Font Awesome Free 6.4.2 glyphs actually
  used (18 KB in the document, licence attribution kept in a comment). Font
  Awesome from cdnjs is gone — one render-blocking stylesheet and ~200 KB of
  woff2 saved.
- Fonts: Google Fonts CSS switched to `preload` + `media="print"` / `onload`
  with a `<noscript>` fallback, so it no longer blocks paint. Hero portrait
  preloaded with `fetchpriority="high"`.
- Icons and logo: `images/favicon.svg` (a spine-and-node mark), `favicon-32.png`,
  `apple-touch-icon.png`, and `logo-80.webp` (1.6 KB) replacing the 489 KB
  `icon.png` that was serving as both favicon and 40 px header logo.
- Open Graph + Twitter card meta pointing at `images/gleb-mlops.png`.
- All six embeds `loading="lazy"` (and inside collapsed entries, so the iframe
  is not created until the reader opens one).
- `<b>Career:</b>` inside `<ul>` replaced with `<p class="list-label">` headings;
  bullets are real `<ul>`/`<li>` with an SVG marker instead of inline styles;
  the plot image has `alt`; the copyright year is set by JS with `2026` static
  in the markup.
- Nav drawer: backdrop, outside-tap close, Escape close (kept), 78 vw / 320 px.
- Kept: GA tag, skip link, `:focus-visible`, `prefers-reduced-motion`,
  pinch-zoom, `theme-color`, WebP `<picture>` with intrinsic sizes and
  `loading="lazy"`, `color-scheme`.

## Measured

Chromium 1440×900 and 390×844, serving the worktree directly (external hosts
are unreachable from here, so these are the page's own bytes).

| | before | after |
| --- | --- | --- |
| Initial load, own assets | 6 requests / 1,383 KB | **5 requests / 235 KB** (−83 %) |
| Reading the page as it ships | 19 requests / 2,470 KB | **6 / 278 KB desktop, 5 / 235 KB mobile** (−89 %) |
| Worst case, "Expand all" + full scroll | 19 / 2,470 KB | **18 / 1,307 KB** (−47 %) |
| Phone page height | 16,604 px | **7,578 px** (−54 %) |
| Desktop page height | 11,171 px | 8,031 px |
| `index.html` | 93 KB (27 KB gzipped) | 147 KB (27 KB gzipped) |

`index.html` grows by 54 KB uncompressed — 18 KB of it the icon sprite, the
rest the extra structure — and gzips to the same 27 KB. Against that it drops
`icon.png` (requested twice, 956 KB), `bg.webp` (263 KB) and the whole Font
Awesome CDN round-trip.

Also checked: no horizontal body overflow at 360, 390, 414, 768, 1024, 1440 and
1920 px; every control ≥ 40 px tall; strict HTML5 tag balance clean; every
`<img>` has `alt`; every text/background pair ≥ 6.4:1 (the lowest is muted grey
on the warm surface at 6.9:1, well past AA).

## Deliberately left out

- **The hero background animation.** `bg.webp` (263 KB) was the network-graph
  loop behind the old hero. The spine now carries that motif down the whole
  page, and repeating it behind the hero fights it. That is the one visual
  element this variant drops; the asset is still in the repo.
- **A light theme.** Finding 15 asks for one; it belongs to v03, which is
  building the theme toggle. This variant only adds `color-scheme: dark`.
- **Deleting the dead HTML5 UP template and the PNG fallbacks** (finding 5) —
  that is v01's cleanup and would collide with it. `icon.png` is likewise left
  on disk, just no longer requested.
- **Facades for the embeds.** All six sit inside collapsed `<details>`, so the
  iframe is not created until the reader opens the entry. Same win, none of the
  click-to-play friction.
- **A chronological (oldest-first) toggle.** It would need the DOM reordered or
  `column-reverse` on every chapter, and it makes deep links and the scroll-spy
  ambiguous. One direction, chosen and labelled.
