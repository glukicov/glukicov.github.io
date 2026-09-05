# v08 · Pipeline, refined

**The portfolio as an MLOps pipeline, with the picks from the variant
review folded in.** v06's hero DAG, terminal intro, pipeline stages and ⌘K
palette are unchanged; the navigation becomes v04's segmented control, the
social links become buttons, the DAG's run tag is gone, and v07's g−2
storage-ring simulation opens the research stage as a figure.

## What changed from v06

| Ask | Change |
|---|---|
| Drop the underline under the selected nav item | The nav is now a segmented control: one pill track, the current section a filled pill with a moss icon. No underline, and no `/` prefix. |
| Take the menu arrangement from v04 | v04's pill geometry and active treatment, carrying v06's mono lowercase stage names and their icons. |
| Drop `dag: gleb-lukicov · 7 nodes · 5 stages` | Removed, with its CSS. The `<h1>` now opens the page. |
| Social links as buttons | The hero and footer lists are pill buttons with brand marks and labels, replacing the mono `linkedin/glukicov` text list. |
| Keep the pipeline DAG | Untouched. |
| Keep the ⌘K palette | Untouched, apart from one fix below. |
| Put v07's ring in the research section | `ring.js` opens stage 03 as a captioned figure. |

### The ring, moved and re-toned

In v07 the simulation was the hero background, sized to clear a text column
and painted in the experiment's own blues. Here it is a figure that opens
stage 03, so it is re-cut for that job:

- **Geometry.** Centred in its own panel rather than offset behind text,
  with the radius set from the panel's short side so the whole ring and the
  spin arrows stay in frame. 16:7 on desktop, 4:3.4 on phones.
- **Palette.** Re-toned from v07's ink-blue to this site's tokens: `--ink-1`
  ground, `--paper-3` magnet, `--paper` muons, `--amber` spin arrows,
  positrons and calorimeters, and the ideal orbit dashed in `--moss`.
- **Caption.** A monospace figure caption explains what is being drawn. It
  swaps its last sentence under `prefers-reduced-motion`, because the live
  copy promises pointer interaction a still frame cannot give.
- **Cost control kept from v07.** The loop pauses when the figure leaves the
  viewport or the tab is hidden, and draws a single settled frame under
  reduced motion.

### Fixed while building

- **The pill nav is wider than v06's text nav**, and overflowed the header
  between 881 and 1023 px. The drawer breakpoint moved from 880 to 1024 px,
  so that band gets the drawer instead of a broken bar.
- **The palette lost the X profile.** It indexes link text and skips
  anything under three characters, and the new button reads "X". It now
  falls back to the link's `title` when the text is too short to search on.

### Dead assets removed

v06 left the repository's unused files in place, on the grounds that the page
never requests them. Ported from v01 here: the HTML5 UP "Prologue" template
in `assets/` (33 files, 2.9 MB) and the PNG/JPEG fallbacks behind images the
page now serves as bare WebP (17 files, 8.7 MB), including the 489 KB
`icon.png` and the 269 KB animated hero background that the canvas DAG
replaced. 50 files, 11.6 MB.

Nothing served changes: transfer is byte-identical before and after
(197,275 B at load, 1,309,841 B fully scrolled), with no 404s and no broken
images at either width — which is the proof that none of it was reachable.
`LICENSE.txt` and `contact.html` stay, as they do in v01.

## Measured

Own-origin bytes at 1440×900, third-party embeds and web fonts excluded,
every response body awaited before the count.

| | Requests | Bytes |
|---|---|---|
| master, first load | 6 | 1,416,462 (1,383 KB) |
| v06, first load | 5 | 173,215 (169 KB) |
| **v08, first load** | **6** | **197,275 (193 KB)** |
| master, fully scrolled | 19 | 2,529,028 (2,470 KB) |
| v06, fully scrolled | 18 | 1,285,781 (1,256 KB) |
| **v08, fully scrolled** | **19** | **1,309,841 (1,279 KB)** |

Against the current site that is −86% at first load and −48% for the whole
page. Against v06 it is +24,060 B: `ring.js` at 14,345 B and 9,715 B of
added sprite glyphs for the nav and brand icons. Nothing else grew.

Also checked: no horizontal overflow and the header fits at 360, 390, 700,
860, 900, 1023, 1024, 1100, 1280, 1440 and 1920 px; the drawer opens
full-height with a backdrop and closes on outside tap; the ring animates on
desktop, is byte-identical frame to frame under reduced motion, and its
caption swaps; the palette still finds every stage, artifact and link,
including X.

## Verified unchanged from v06

The DAG and its canvas, the terminal intro, the five stages with their
status chips and metadata, all 24 artifacts, all six live embeds, every
link and every `alt`, the scroll-spy, the skip link and the focus styles.

---

Everything below is v06's design plan, which this variant still follows.

## v06 · Pipeline — the original plan

**The portfolio as an MLOps pipeline.** The hero is an interactive DAG whose
nodes are the navigation — physics → data → platform → community → writing,
with `outreach` and `interests` branching off — and every section below is a
pipeline stage with a status chip, a monospace metadata line and its contents
listed as typed artifacts. A ⌘K command palette indexes every stage, artifact
and outbound link at load, so the whole site is reachable from the keyboard.

## Design plan (written before the build)

**Concept.** Gleb ships ML platforms; the site should read like the thing he
builds. Not a metaphor sprinkled on top — the page *is* a run: a DAG at the
top, stages below, each with inputs, outputs and a duration, each output an
artifact with a type tag. Every number in a metadata line is already on the
page; nothing is invented.

**The DAG.** Full hero width. Edges are drawn on a `<canvas>` as left→right
cubic curves (the Airflow graph-view idiom); nodes are real `<a>` elements
positioned over the canvas, so they are focusable, keyboard-reachable and
their labels are selectable text that can never be clipped by the drawing.
Hover or focus a node and the canvas redraws with its incident edges lit and
the rest dimmed. Edges carry a slow dash offset (data flowing) under normal
motion and are drawn once, static, under `prefers-reduced-motion`; the
animation also stops when the hero scrolls out of view. Below the graph
breakpoint the canvas is hidden and the same anchors reflow into a vertical
rail of stage chips. With JS off they are a wrapped row of chips — still
links, still work. (Planned at 700 px; moved to 860 px during the build,
because between 700 and 860 the five spine nodes leave no room for readable
edges. Between 860 and 1140 px the node pills shrink a step instead.)

Node → target: `physics` → Research, `data` → ML projects, `platform` →
SlideOps, `community` → AAIF, `writing` → the MLOps article, `outreach` →
Education, `interests` → Interests.

**The intro as a terminal session.** A panel with a title bar, a prompt line
`$ gleb --about`, and the three existing hero paragraphs as the command's
output. The command types, then the output types, with a block caret; the
whole thing is done in ~1.6 s and hard-completes at 2 s, so a post-load
screenshot shows the full text. The text is real DOM text at all times: the
typing only ever slices it, the container's height is reserved before the
first frame so nothing shifts, and with JS off or reduced motion on, the
paragraphs simply render.

**Stages.** Each section becomes `stage NN` with a status chip (`succeeded`
for finished work, `running` for work still going) and a metadata line built
only from facts already on the page — 200 collaborators, 20 GB/s → 200 MB/s,
+3 % yield, 2017–2019, £2.3K + £3.8K, 300 pupils a year. Items become
artifacts: a type tag (`repo`, `article`, `video`, `podcast`, `talk`, `photo`,
`paper`, `book`), a title, the copy and its links. Embeds keep aspect boxes.

**Palette.** Strict monochrome ink and warm paper, one accent. The accent
stays moss `#a8b33e`: it is already the site's colour, and it is by chance
exactly the P1-phosphor yellow-green of a CRT terminal, which is the register
this variant wants — swapping it for a "greener" green would be a change for
its own sake. Ground `#0b0b0a`, surfaces `#131311`, text a warm grey `#e2ded4`.
Colour appears semantically in exactly two more places: the `succeeded` chip
(moss) and the `running` chip (amber `#e0a63c`). No other hue on the page.

**Type.** JetBrains Mono for everything structural — logo subtitle, nav,
prompts, metadata, chips, tags, palette, footer — and Inter for reading text
at a ~65 ch measure. The mono/sans split is the whole visual system: if it is
machine-written it is mono, if a person wrote it it is sans.

**Command palette.** ⌘K / Ctrl-K, plus a visible `Search ⌘K` button in the
header so phones can reach it. The index is built from the DOM at load
(stage titles, artifact titles, outbound links), matched with a subsequence
fuzzy score, driven with ↑ ↓ and Enter, closed with Escape, focus trapped
while open, and it restores focus to whatever opened it.

## What changed, and why

- **New head.** SVG + 32 px + 180 px favicons instead of the 489 KB
  `icon.png`; Open Graph and Twitter card meta (finding 6); `color-scheme:
  dark`; `theme-color` matched to the new ground; `preconnect` for both font
  hosts. `icon.png` (489 KB) is replaced as the header logo by
  `logo-80.webp` (1.6 KB).
- **Font Awesome dropped** (finding 2): a render-blocking CDN stylesheet plus
  ~200 KB of woff2 for about 30 glyphs. Replaced by an inline SVG sprite of
  the five symbols this design actually uses — search, menu, close, arrow,
  external link. The decorative in-prose icons were `aria-hidden` ornaments
  and are gone: this design states a type with a text tag, not a pictogram.
  The four social links became mono text (`github/glukicov`), which is more
  legible than an icon-only link and needs no brand glyphs.
- **The 269 KB animated hero background is gone**, replaced by the DAG, which
  is drawn in ~90 lines of canvas and weighs nothing.
- **`<picture>` collapsed to bare `<img src="…webp">`.** Same lazy loading,
  same `decoding="async"`, same intrinsic `width`/`height`, no layout shift —
  the PNG/JPEG fallbacks were dead weight (finding 5).
- **Iframes now lazy** (finding 4). All six embeds are still live iframes;
  they are simply no longer on the critical path. Each also gained a `title`.
  CARRYOVER.md point 2 updated to match.
- **Real `<h1>`** (finding 12), `alt` on the g−2 plot (finding 14), copyright
  year set by JS over a static fallback, `<b>Career:</b>` lifted out of the
  `<ul>` into a real sub-heading with its own list (finding 14), `rel="noopener"`
  on every `target="_blank"`.
- **Phone layout** (findings 7, 8, 10, 11): left-aligned intro, stage titles
  that no longer stack three deep, artifacts that carry a type tag and a
  title so the page can be skimmed, and a nav drawer with a backdrop that
  closes on an outside tap.
- **Scroll-spy kept** (IntersectionObserver, no scroll handler) and extended:
  the active stage lights its DAG node as well as its nav link.

## Measured

Local bytes for `index.html` and its own assets, at 1440×900, before and
after (third-party embeds excluded — they are unchanged, and unreachable
from the build box):

| | requests | bytes |
|---|---|---|
| before, first load | 6 | 926,692 |
| after, first load | 5 | 173,043 |
| before, after full scroll | 19 | 2,039,258 |
| after, after full scroll | 18 | 1,285,609 |

First load is **−81 %**: the 489 KB favicon-as-logo and the 269 KB hero
animation are both gone. Whole-page **−37 %**. Off-site, one render-blocking
stylesheet disappears (`cdnjs.cloudflare.com`, Font Awesome) along with its
font files. `index.html` itself goes 95,208 → 98,596 bytes (+3.6 %) for the
DAG, the palette, the metadata blocks and the artifact structure; inline CSS
is 26 KB and inline JS is 11.8 KB, both unminified and dependency-free.

Layout was swept at 360, 600, 700, 820, 858, 860, 880, 900, 1000, 1100,
1140, 1141, 1280, 1440 and 1920 px: no DAG label overlaps and no horizontal
document overflow at any of them. Phone page height is 17,042 px against the
current site's 17,053 px measured the same way.

## Deliberately left out

- **No light theme.** A terminal is a dark surface; a paper mode is a
  different variant's idea (v03 has it).
- **No scroll-triggered reveals.** Every stage is fully rendered at rest, so
  the page reads in a static screenshot and in print.
- **Node positions are hand-placed, not auto-laid-out.** Seven nodes do not
  need a Sugiyama implementation, and hand placement is what guarantees the
  labels never collide.
- **No search over body copy.** The palette indexes stage titles, artifact
  titles and outbound links — the things you navigate to. Full-text search
  of every paragraph would return noise on a single-page site.
