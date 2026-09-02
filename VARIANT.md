# v02 · Motion & polish

The noir-moss site exactly as it looks today, with the shared hygiene and
weight fixes applied and a restrained motion layer laid on top. Every moving
part starts from a state that is already readable, so the page reads in full
in a static screenshot, with JavaScript off, and under
`prefers-reduced-motion: reduce`.

## What changed and why

### Hygiene (the shared brief)

- **Favicon and header logo.** `images/icon.png` (489 KB, the same pixels as
  `main.png`) was both the favicon and the 40 px header mark. Replaced with
  `favicon-32.png` (2.8 KB), `apple-touch-icon.png` (22 KB) and
  `logo-80.webp` (1.6 KB), all generated from `images/main.webp` with Pillow.
  The logo `<img>` gets intrinsic `width`/`height` and an empty `alt` — the
  name sits next to it in text.
- **Social cards.** Open Graph and Twitter meta (`og:title`,
  `og:description`, `og:image` → `images/gleb-mlops.png`, `og:url`,
  `twitter:card=summary_large_image`), plus `<link rel="canonical">`.
- **A real `<h1>`.** The hero's `<h1>` was commented out; it is back as a
  visually-hidden "Gleb Lukicov: MLOps Leader, PhD in Physics".
- **Valid list markup.** The two icon lists were built from inline styles
  with a bare `<b>Career:</b>` sitting directly inside a `<ul>` (invalid).
  Now one `.icon-list` class, and Technical/Career are `<p>` headings above
  two separate lists.
- **`alt` on every image.** The g−2 asymmetry plot had none.
- **Copyright year** set from JS with the static `2025` as the fallback.
- **`title` and `loading="lazy"` on all six embeds.** They still render as
  live iframes — they are just off the critical path now.
- **`color-scheme: dark`** so the browser paints scrollbars and form
  controls to match, plus a `<meta name="color-scheme">`.
- **Fonts off the critical path.** The Google Fonts stylesheet is preloaded
  and swapped in on load, with a `<noscript>` fallback; `preconnect` for
  cdnjs and Google Fonts; `preload` for the hero portrait.

### Layout bugs found while measuring

- **`.card { height: 100% }` was clipping content.** On a card outside a
  grid the declaration resolved to the viewport height (900 px), so the
  SlideOps card — the one thing being shipped right now — lost its last
  paragraph, its `npx skills add` line and all three buttons behind
  `overflow: hidden`, while the resources card carried 500 px of dead space.
  Scoped to `.grid > .card`, which is where equal-height rows are actually
  wanted. Desktop page height 12,343 px → 11,284 px.
- **Tap targets.** The hamburger and drawer-close buttons were 24 px and the
  card buttons 38 px. All are now at least 40 px (44 px for the two icon
  buttons) without moving anything optically.
- **The drawer backdrop never appeared.** `display: none` in the base rule
  was not undone inside the mobile media query, so outside-tap-to-close was
  dead. Fixed.

### The motion layer

`@media (prefers-reduced-motion: reduce)` already clamps every animation and
transition on the page to 0.01 ms. On top of that, each piece below either
lives inside `@media (prefers-reduced-motion: no-preference)` or is skipped
by a `matchMedia` check in JS, so nothing merely runs faster — it does not
run at all.

| Piece | How it behaves | Reduced motion |
| --- | --- | --- |
| Hero entrance | Portrait, copy, CTA and social row step up 14 px and fade in, 0.4 s each at 0 / 0.07 / 0.14 / 0.2 s — settled by 0.6 s. Pure CSS with `animation-fill-mode: both`, no JS, so nothing can leave it hidden. | The whole keyframe block sits inside `no-preference`; without it the four elements are simply visible. |
| Social ring pulse | One pulse at 0.65 s instead of the old `pulse 2s infinite`, plus the existing hover lift and glow. | Same `no-preference` block. |
| Card reveal | JS marks only the cards still below the fold `.is-pending` (opacity .6, 12 px down); an IntersectionObserver takes the class off as each arrives — 350 ms, `translateY` + opacity. | The `.is-pending` rules live in `no-preference`, and the JS that adds the class checks `matchMedia` first, so the class is never added and the observer never runs. |
| Section-title underline | The 80 px moss bar draws from `scaleX(0)` when its section activates, 600 ms. | Same gating. If the observer never fires the bar is drawn anyway — the resting state is the full 80 px. |
| Card hover | Image scales 1.03 inside its own clipped box, card lifts 4 px, hairline border warms to moss. | Image scale is inside `no-preference and (hover: hover)`; the lift and border are transitions the reduce block clamps. |
| Button fill | `.card-link` fills in 120 ms on hover/focus — colour only, no layout. | Transition, clamped by the reduce block. |
| Nav indicator | One 2 px bar slides and resizes between active links, driven by the existing IntersectionObserver scroll-spy. Re-measured on resize (rAF) and after `document.fonts.ready`. `.nav-link` no longer transitions `padding`, which had made the bar measure a stale width for 200 ms after a breakpoint change. | Transition, clamped; it still tracks the right link, it just jumps. |
| Reading progress | 2 px moss line on the header's bottom edge, `scaleX(--progress)` from a rAF-throttled passive scroll listener. Deliberately has no easing of its own — it tracks the scrollbar, so it is information rather than decoration and stays on under reduce. | Unchanged, on purpose. |
| Header compaction | `.header.scrolled` past 50 px, padding only. | Transition, clamped. |
| Hero parallax | The network layer drifts up to ±12 px against pointer position via `--hx` / `--hy` on `.hero`, rAF-throttled `pointermove`, `pointerleave` recentres. The layer is bled 16 px past every edge so the drift never shows a seam. | The listener is attached only when `matchMedia("(hover: hover) and (pointer: fine)")` matches **and** motion is allowed — off on touch, off under reduce. |
| Back to top | 44 px control, bottom right, after one viewport of scroll. | Appears the same way; `window.scrollTo` asks for `behavior: "smooth"` only when motion is allowed, otherwise `"auto"`. |
| Mobile drawer | Slides in on `transform` behind a fading backdrop; outside tap closes, `Escape` closes, body scroll locks, focus moves to the close button and back to the hamburger. | Transitions clamped; every behaviour still works. |

All of it is inline, dependency-free, and about 130 lines of JS.

## What I measured

Chromium, first-party bytes only (`index.html` plus everything it loads from
its own origin). Third-party embeds and CDN fonts are unreachable from this
environment and are excluded from both sides.

| | requests | bytes |
| --- | --- | --- |
| Before, at load | 6 | 926,692 (905 KB) |
| After, at load | 6 | 458,486 (448 KB) — **−49 %** |
| Before, after a full scroll | 19 | 2,039,258 (1,991 KB) |
| After, after a full scroll | 19 | 1,571,052 (1,534 KB) — **−23 %** |

`index.html` itself grew 95,208 → 112,289 bytes; the 489 KB `icon.png` going
away more than pays for it. The request count is unchanged: `icon.png` was
one request, `favicon-32.png` + `logo-80.webp` are two, and one image drops
out of the first paint.

Also checked: no horizontal scroll at 360 / 390 / 768 / 1024 / 1440 / 1920 px;
every link and button at least 40 px tall; tag balance and unique IDs clean;
renders in full with JavaScript disabled and under `prefers-reduced-motion:
reduce`.

## Deliberately left out

- **Font Awesome stays on cdnjs.** Replacing it with an inline SVG sprite is
  v01's job; doing it here would have made this diff about icons instead of
  about motion. It is still the one render-blocking stylesheet.
- **No scroll-linked parallax.** Pointer-driven only. Tying the hero to
  scroll position is the effect that makes a page feel heavy on a phone —
  exactly the device that can least afford it.
- **No page-load overlay or reveal curtain.** Nothing may sit between the
  visitor and the content.
- **The phone layout is otherwise untouched.** The centred hero copy, the
  16,798 px page height and the fixed-height embed boxes are v01's and
  v03's territory.
- **The drawer's active-link underline still spans the full drawer width,**
  as it does today. It reads like a stray rule, but it is current behaviour
  and changing it is a design decision, not a fix.
