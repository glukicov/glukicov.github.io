# v07 · Muon

## Design plan

**Concept.** Gleb's career runs from a 14-metre superconducting storage ring at
Fermilab to MLOps platforms in London, so the site borrows the visual language of
the physics rather than of a portfolio template: the hero is a live canvas
simulation of muons circulating in the Muon *g*-2 ring seen from above, and the
page below it is set like a paper - abstract, numbered sections, numbered
figures, and a references list that collects every external link on the page.

**Plan followed.**

1. *Hero.* A `<canvas>` behind the title block draws the ring from above: a faint
   steel-blue annulus for the magnet, the dashed ideal orbit, the inflector mark,
   24 calorimeter stations on the inside, and up to 40 muons with a short trail
   and an amber spin arrow that precesses ahead of the momentum. Muons decay on
   an exponential lifetime; each decay flashes and sends a positron curling
   inward to the nearest downstream station, which lights up. The pointer pushes
   nearby muons radially and hurries them slightly.
2. *Structure.* Title block (`<h1>`, affiliation line, labelled social links) ->
   Abstract -> 1 Community, 2 Engineering, 3 Research (3.1-3.5), 4 Outreach,
   5 Interests -> Section-mark References.
3. *Figures.* Every image and embed is a `<figure>` with a numbered
   `<figcaption>` written from the existing `alt`/caption text. Embeds keep their
   aspect boxes.
4. *Type.* **Source Serif 4** for headings and body - a text face designed for
   long-form screen reading with real optical sizing, which is what a paper
   layout needs, and unlike the tired portfolio serifs it has an unfussy,
   institutional voice. **IBM Plex Sans** for captions, labels, references and
   nav: a technical companion with tabular figures. Major-third scale from
   17 px; `font-variant-numeric: tabular-nums` on every numbered surface.
5. *Palette.* Deep ink blue `#0b1526` (the lab at night), warm white `#eee7d9`,
   calorimeter amber `#f2b656` as the only accent, magnet steel `#8fb3e6`
   reserved for the ring and hairlines. Dark only, painted explicitly; no
   inherited moss.

## What changed, and why

- **Hero.** The 269 KB animated-WebP network loop is replaced by `ring.js`
  (14.8 KB, dependency-free): the g-2 ring, drawn. It is the one image on the
  page that is actually about him. Capped at 40 particles (22 on phones),
  `requestAnimationFrame`, paused by `IntersectionObserver` when the hero leaves
  the viewport and by `visibilitychange` when the tab is hidden. Under
  `prefers-reduced-motion` it draws a single pre-rolled still - an evenly filled
  beam with a few positron tracks still in flight - and the hero caption swaps to
  wording that describes a still rather than an animation.
- **Paper structure.** Sections are numbered 1-5 and hang their numbers in the
  left margin above 1120 px. The old "About me / MLOps / ML Projects / Research /
  Outreach / Interests" nav becomes numbered links plus References.
- **References.** `tools/refs.py` walks `<main>`, gives every external link a
  superscript marker in order of first citation, reuses the number when a URL is
  cited again, and regenerates the `<ol class="refs">` between the
  `refs:start`/`refs:end` comments. It also numbers the figures and resolves
  `<a class="figref">` cross-references. **The output is committed static HTML -
  the site itself still has no build step.** `python3 tools/refs.py --check`
  fails if the page and the list have drifted. 39 references, 20 figures.
- **Icons.** Font Awesome (a whole CSS file plus webfonts from cdnjs) is gone,
  replaced by a six-symbol inline SVG sprite (LinkedIn, GitHub, Medium, X, menu,
  close) plus a cowboy hat, so the footer keeps its "Made with ..." joke.
- **Header logo.** `images/icon.png` (489 KB) -> `images/logo-80.webp` (1.6 KB).
- **Favicons.** `images/favicon.svg` (the ring, a muon and its spin arrow, drawn
  at 32 px), `favicon-32.png` and `apple-touch-icon.png` from `main.webp`.
- **Meta.** Open Graph and Twitter card added, `theme-color` `#0b1526`,
  `color-scheme: dark`, fonts loaded non-render-blocking with a `<noscript>`
  fallback, `main.webp` preloaded.
- **Bugs fixed while finishing.** The `.more` arrow/underline rule was matching
  the superscript anchors too, so every "read more" link rendered as an arrow
  followed by its reference number; the top bar's `backdrop-filter` made it the
  containing block for the fixed mobile drawer, which trapped the drawer in a
  56 px strip; positron tracks used an unwrapped orbit angle and shot straight
  across the ring instead of curling to a station; the scroll-spy observed the
  Abstract, which has no nav entry, and blanked the bar while it was in the
  reading band; the running head and the affiliation line both wrapped badly.

## Measured

| | index.html | own assets | total | requests |
|---|---|---|---|---|
| before | 95,208 B | 1,944,050 B | 2,039,258 B | 18 |
| after | 98,361 B | 1,224,903 B | 1,323,264 B | 21 |

-716 KB (-35%). The saving is `icon.png` (-488 KB) and the animated hero WebP
(-269 KB); the added requests are `ring.js` and three favicon files (the 180 px
Apple icon is only fetched by iOS). Two third-party requests also go away with
Font Awesome (its stylesheet and the webfont it pulls); Google Fonts is the only
remaining external stylesheet.

Contrast, darkest pair on the page: `--text-2` `#b9c1cf` on `--ink-3` `#172741`
= 8.3:1. Body text 14.9:1. No horizontal overflow at 360, 390 or 1440 px.
Strict HTML5 parse: no unclosed tags, no duplicate ids, no broken fragments,
`alt` on all 16 images.

## Left out on purpose

- **No light theme.** The ring only reads on a dark ground, and a light mode
  would need a second palette for the canvas. Everything is painted explicitly,
  so nothing borrows the host's colours.
- **The real precession ratio.** The spin gains on the momentum by one turn per
  6 orbits in the simulation; in the experiment it is about one per 29. At the
  true ratio the drift is invisible at this scale, and the point of the hero is
  to show that the arrow leads.
- **Embed facades.** All six embeds keep their real `<iframe>`s and
  `loading="lazy"`. No poster facades - CARRYOVER point 2 says that is the
  owner's call.
- **Dead assets kept.** `images/icon.png`, `bg.gif` and `bg.webp` are no longer
  referenced but are left in the repo; nothing on the page fetches them.
