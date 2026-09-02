# v03 · Editorial

A magazine treatment of the same material: a masthead-scale name, a split
hero with the portrait on the right, and five editorial rows that each lead
with one featured story and list the rest. Hairline rules, a single type
scale and whitespace do the work that fifteen identical cards used to do.

## Design plan

Written before the build; the sections below record what actually shipped.

**Palette.** Light is the default: `--paper #e9e9e4`, a cool, faintly green
grey — recycled lab-notebook stock and a London overcast, not the
sun-bleached cream of every "editorial" template. Ink is `#14171a`, a slate
near-black rather than pure black, so the page reads as printed rather than
back-lit. The accent is the site's existing moss/chartreuse, carried across
the redesign rather than thrown away: darkened to `#46600a` so it passes AA
as link text on paper (5.9:1), and returning to its bright `#c3d24f` in the
dark counterpart (11.3:1 on `#101214`). It is also, not incidentally, the
colour of a hi-vis jacket on a London road bike. Both palettes are `:root`
tokens; the dark set is defined twice — once under
`@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`,
once under `:root[data-theme="dark"]` — so the header toggle wins in both
directions and the OS preference is honoured when nothing is stored.
`localStorage` remembers the choice, an inline head script applies it before
first paint, and `<meta name="theme-color">` follows.

**Type.** Display is **Archivo** at an expanded width (`wdth 118`, weight
700). Justification: a grotesk, not a serif — the serif display face is the
first move of the cliché this variant is told to avoid, and Archivo's
lineage is newspaper and signage rather than fashion magazine. Expanded and
set at 6.5rem it gives the name the authority of a printed masthead, and it
still holds together at 2rem for section titles, where a high-contrast
didone would go fussy and thin. Body is **IBM Plex Sans**: a humanist sans
drawn for technical documentation, which is the register of most of this
page, and a natural companion to **JetBrains Mono** — already on the site —
which carries the "now" strip, the kickers, the per-item metadata, the code
blocks and the links. One scale (`--f-xs` .75rem → `--f-display`), body at
17px/1.62 with a 65-character measure.

**Layout.** Split hero on desktop: name, one-line thesis, the three intro
paragraphs at reading width and the "now" strip on the left; the portrait,
square and ruled, in a 300px right column behind a vertical hairline. Under
900px it stacks with the portrait first at 168px. Each section is an
editorial row: a header band (mono kicker, title left, standfirst right),
one featured item with large ruled media, then the rest as compact list rows
— thumbnail, title, mono source label, body, links. At ≥1200px a slim
sticky table of contents sits in a left rail, driven by the same
IntersectionObserver that already powered the nav scroll-spy.

**Hero animation.** Dropped, and quietly reinterpreted. The 269 KB animated
WebP network graph goes; in its place the hero sits on a CSS-only 44px
graph-paper grid at low rule opacity, masked to fade out before the "now"
strip. Zero bytes, the same "lines and nodes" idea, and it needs no
`prefers-reduced-motion` gate because it never moves.

## What changed and why

- **Rewrote the CSS and the markup.** Cards, the noir ground, the
  moss-on-black palette and the uniform two-column grid are gone. Sections
  are rows; hierarchy comes from size, rules and whitespace. Borders and
  shadows are reserved for featured media and embeds, as the brief asks.
- **Featured items.** SlideOps (ML projects), the g−2 Breakthrough Prize
  video (Research), the AAIF photo (Community), the Fermilab tour
  (Education) and the first charity ride (Interests) each lead their section
  at full content width. Everything else is a list row. This fixes the
  finding that a 2019 GPU post carried the same visual weight as the thing
  being shipped now.
- **Theme toggle** in the header, persisted, no flash of the wrong theme.
- **Font Awesome removed.** ~200 KB of webfont plus a render-blocking
  stylesheet replaced by a ten-symbol inline SVG sprite (LinkedIn, GitHub,
  Medium, X, menu, close, arrow, sun, moon, cowboy hat). Paths are Font
  Awesome Free 6.4.2, CC BY 4.0, credited in a comment beside the sprite.
  The ~25 decorative `aria-hidden` glyphs sprinkled through the prose
  (rocket, crown, shield, magnifying glass, …) are simply gone: an editorial
  page emphasises with type, not with icons. The cowboy hat stays because it
  is part of a sentence, not decoration.
- **Hygiene.** `images/favicon-32.png` + `images/apple-touch-icon.png` and a
  2 KB `images/logo.webp` replace the 489 KB `icon.png` that was doing both
  jobs; Open Graph and Twitter card meta; a real visible `<h1>`; `alt` on
  the previously bare g−2 plot; copyright year from JS with a static
  fallback; the `<b>Career:</b>` that sat loose inside a `<ul>` is now a
  heading with its own list.
- **Perf.** Google Fonts loads non-blocking (`media="print"` swap plus a
  `<noscript>` fallback); the hero portrait is preloaded with
  `fetchpriority="high"`; all six embeds are `loading="lazy"`; the 269 KB
  hero animation is dropped.
- **Mobile.** Drawer with a backdrop that closes on tap, on Escape and on
  link activation; left-aligned hero copy; list rows use an 88px square
  thumbnail so the page is skimmable instead of a stack of full-bleed
  images.

## Measured

Headless Chromium against `index.html` and its own assets served from disk
(third-party hosts are unreachable from here, so these are first-party bytes
only; Font Awesome's ~200 KB of CSS + woff2 and the six embeds are extra on
top of the "before" column in real life).

| | before | after |
|---|---|---|
| First paint (no scroll): requests / bytes | 6 / 1,383 KB | 5 / **167 KB** (−88%) |
| Whole page scrolled: requests / bytes | 19 / 2,470 KB | 18 / **1,253 KB** (−49%) |
| Third-party requests before `load` | 9 | 3 |
| `index.html` itself | 93 KB | 91 KB |
| Page height at 390 px | 16,604 px | **14,573 px** (−12%) |
| Page height at 1440 px | 11,171 px | 14,437 px (+29%) |

The first-paint saving is `images/icon.png` (478 KB, fetched twice as both
favicon and 40 px logo) and the 263 KB hero animation going away, replaced by
a 2 KB `logo.webp` and a 2 KB favicon. Font Awesome disappears from the
critical path entirely, and Google Fonts no longer blocks render.

The desktop page is 29% taller and that is the deliberate trade: a two-column
card grid became one editorial column, which is why the phone — where the old
grid collapsed to one column anyway — gets 12% shorter instead. The sticky
rail table of contents exists to pay for the extra desktop length.

Checked at 360, 500, 760, 900, 1024, 1100, 1199, 1200 and 1920 px: no
horizontal overflow at any of them. Drawer opens/closes on button, backdrop
and Escape; the theme toggle round-trips `data-theme`, `localStorage` and
`theme-color` in both directions.

## Deliberately left out

- No scroll-triggered reveals and no parallax. This variant's argument is
  that print hierarchy is enough; adding motion would blur it, and v02 is
  already the motion variant.
- No truncation. Every card's body text is kept in full inside its list row,
  so the "compact" rows are compact in layout, not in content.
- The PNG/JPEG fallbacks behind each `<picture>` are kept, so this branch is
  a drop-in re-skin; deleting them is v01's job.
