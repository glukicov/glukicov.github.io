# v06 · Pipeline

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
- **The dead HTML5 UP template in `assets/` and the PNG/JPEG fallbacks are
  still on disk.** The page no longer requests any of them, so they cost a
  visitor nothing; deleting them is v01's job and would only add noise here.
- **Node positions are hand-placed, not auto-laid-out.** Seven nodes do not
  need a Sugiyama implementation, and hand placement is what guarantees the
  labels never collide.
- **No search over body copy.** The palette indexes stage titles, artifact
  titles and outbound links — the things you navigate to. Full-text search
  of every paragraph would return noise on a single-page site.
