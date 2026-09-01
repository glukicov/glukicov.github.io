# Design variants — plan and review notes

Live site: https://glukicov.github.io (byte-identical to `index.html` on master at the time of review).
Reviewed on 2026-09-01 at 1440×900 and 390×844, plus a read of the markup and CSS.

## What is there today

A single-page portfolio: fixed header with six nav links, a hero with a
network-graph animation behind three centred paragraphs, then five sections
(AAIF Community, ML projects and articles, Research, Education, Interests)
rendered as a uniform two-column card grid, and a footer. Noir ground
(`#0b0c0e`), moss accent (`#a8b33e`), Inter + JetBrains Mono, Font Awesome 6.
All CSS and JS are inline in `index.html` (~95 KB). Photos are WebP inside
`<picture>` with lazy loading and intrinsic sizes.

### Findings

Performance and loading

1. `images/icon.png` (489 KB, same pixels as `main.png`) is both the favicon and
   the 40 px header logo. Half a megabyte for a 40 px circle, on every visit.
2. Font Awesome 6 is loaded whole from cdnjs (CSS + ~200 KB of woff2) for about
   30 glyphs, and the stylesheet is render-blocking.
3. Google Fonts CSS is render-blocking; there is no `preload` for the hero
   photo or the animated hero background (269 KB WebP).
4. Six third-party iframes (LinkedIn, Spotify, four YouTube) load eagerly on
   first paint. Owner's choice (see CARRYOVER.md), but `loading="lazy"` on the
   below-the-fold ones keeps them click-free while removing them from the
   critical path.
5. Repository dead weight that is never requested by the page: the original
   HTML5 UP "Prologue" template (`assets/`, 3 MB) and the PNG/JPEG fallbacks
   behind every `<picture>` (7.6 MB). WebP has been universally supported since
   2020. Not a runtime cost, but a clone/maintenance cost.
6. No Open Graph / Twitter card metadata, so a LinkedIn or X share of the site
   shows a bare link. For someone who organises Europe's largest AI meetup,
   this is the most visible missing piece.

Mobile

7. The hero is three long centred paragraphs. Centred body copy is hard to
   read past two lines; on a phone it is a 40-line block.
8. "Agentic AI Foundation (AAIF) Community London" wraps to three lines as a
   section title on a phone.
9. Embed cards reserve fixed heights (LinkedIn 650 px) and show as large empty
   boxes while the third party loads, or forever if it is blocked.
10. The phone page is ~16,600 px tall. Every card is full-width and full
    height; there is no way to skim.
11. The nav drawer is 70 % wide with no backdrop; tapping outside does not
    close it.

Structure and semantics

12. There is no `<h1>` (it is commented out in the hero). The page's only
    name is the `<title>`.
13. All cards weigh the same. SlideOps (the one thing the owner is shipping
    now) gets a wider card but the same visual treatment as a 2019 GPU
    server post.
14. List bullets are hand-positioned with inline styles; `<b>Career:</b>`
    sits directly inside a `<ul>` (invalid); the plot image has no `alt`;
    the copyright year is hard-coded.
15. There is no light theme and no `color-scheme` hint; the OS-level dark
    scrollbar/form control colours are not requested.

### Non-negotiables carried into every variant

Every variant keeps: all content, links and alt text; the WebP `<picture>`
pattern with lazy loading and intrinsic sizes; `prefers-reduced-motion`;
`:focus-visible`; the skip link; pinch-zoom (no `user-scalable=no`);
`theme-color`; the GA tag; WCAG AA contrast; strict HTML5. Every variant also
adopts the cheap hygiene fixes: a real small favicon (SVG + 32/180 px PNG), a
small header-logo asset, OG/Twitter meta, a visible or visually-hidden `<h1>`,
`alt` on every image, an automatic copyright year, valid list markup.

## The portfolio

Seven variants, each on its own branch and worktree, each bundled into a
private preview. Ordered from "would almost certainly merge" to "a real bet".

### Tier 1 — safe wins (same look, better site)

**v01 · Tune-up.** No visual change on desktop. Fixes findings 1–6, 11, 12,
14, 15. Replaces Font Awesome with an inline SVG sprite of the ~30 glyphs
actually used; self-hosts nothing new. Preloads the hero image and font CSS.
Phone-only layout fixes: left-aligned hero copy under 600 px, tighter section
titles, drawer backdrop and outside-tap close, single-column button stacks
become a wrapping row. Deletes the dead template and the PNG fallbacks.
Reports before/after transfer size and request count.

**v02 · Motion & polish.** Everything in v01 plus a considered motion layer:
staggered hero entrance, cards reveal on scroll from a visible resting state
(never `opacity: 0` at rest), image zoom on card hover, a sliding nav
indicator, a thin reading-progress line under the header, a back-to-top
control, and a hero background that responds gently to pointer position.
All gated behind `prefers-reduced-motion`.

### Tier 2 — daring (new layout, same content)

**v03 · Editorial.** A magazine treatment. Split hero: a large typographic
name and one-line thesis on the left with a short "now" strip (role, AAIF,
PhD), the portrait on the right. Sections become editorial rows: one featured
item with a full-bleed image and a list of the rest, instead of a uniform
grid. A sticky in-page table of contents on wide screens. A warm-paper light
theme with a dark counterpart and a toggle; a serif display face paired with
a humanist sans.

**v04 · Bento.** The site as a dashboard, which is how an MLOps engineer
reads the world. The hero is a bento grid: portrait tile, one-line thesis,
figure tiles drawn from the content (200 collaborators, 20 GB/s → 200 MB/s,
£6.1K raised, Europe's largest AI meetup), tag chips, a monospace status
line. Sections keep bento tiles of mixed span so the important items are
literally bigger. Cool neutrals, moss accent kept.

**v05 · Timeline.** The content is a career arc, so the page becomes one:
Your Universe festival (2010–15) → Fermilab DAQ on-call (2017–19) → PhD and
the g−2 result → DevOps awards (2022–23) → Electric Twin → AAIF London →
SlideOps (2026). A vertical spine carries the network-line motif from the
current hero; chapters snap in as you scroll with sticky year markers.
Cards become entries with a date, a one-line summary and an expandable body,
which also fixes the phone-height problem.

### Tier 3 — unique (form follows the person)

**v06 · Pipeline.** The portfolio as an MLOps pipeline. The hero is an
interactive DAG drawn on canvas — physics → data → platform → community →
writing — whose nodes are the nav; clicking one scrolls to its stage.
Each section is a pipeline stage with a status chip, a monospace metadata
line (inputs, outputs, duration) and its outputs listed as artifacts. A
command palette (⌘K / Ctrl-K) searches every section, link and article.
The hero copy types in like a CLI session. Strict monochrome plus one accent.

**v07 · Muon.** Physics as the visual language. The hero background is a
canvas simulation of muons precessing in the g−2 storage ring (the actual
experiment), reacting to the pointer and frozen under reduced motion. The
page is set like a paper: an abstract, numbered sections (1 Community,
2 Engineering, 3 Research, 4 Outreach, 5 Interests), figures with numbered
captions, a references list that collects every external link. A scientific
serif for display, a clean sans for body, tabular figures. A palette chosen
for the subject rather than inherited.

## How to inspect

Each variant lives on a branch named
`claude/website-design-variants-ff49ga-vNN-<slug>` and carries its own
`VARIANT.md` describing what changed and why. `tools/preview_bundle.py`
turns any variant's `index.html` into a single self-contained file (images
inlined, embeds replaced by poster facades because the private preview host
blocks third-party frames) which is what the private preview links show.
The real branch keeps the live embeds.
