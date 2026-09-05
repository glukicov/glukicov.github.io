# Carry-over — keep these in any future redesign

Six things this assembly is carrying that are easy to lose in a re-skin.

1. **Images.** All 15 photos are WebP with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. v06 serves them as bare `<img src="…webp">`
   rather than `<picture>` with a PNG/JPEG fallback — WebP has been
   universally supported since 2020 — so the raster fallbacks in `images/`
   are no longer requested by the page. The 269 KB animated-WebP hero
   background is gone: v06's hero is a canvas-drawn DAG that weighs nothing.
2. **Embeds are live, and lazy.** All six embeds (LinkedIn, Spotify, four
   YouTube) are still real iframes in the page, but v06 marks them
   `loading="lazy"` so they are off the critical path. Do not swap them for
   click-to-load facades: the owner wants them live.
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text, `aria-expanded`/`aria-controls` on the menu buttons,
   Escape closes the drawer and the command palette, skip link to main
   content. The DAG's nodes are real `<a>` elements over the canvas, so the
   hero graph is keyboard-reachable; the canvas itself is `aria-hidden`.
4. **Scroll-spy.** IntersectionObserver drives the active nav state — no
   scroll handler. It also lights the matching DAG node, and in v08 it fills
   the current pill in the segmented nav.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1).
6. **The storage ring is decorative but cheap.** The stage-03 canvas pauses
   when it scrolls out of view or the tab is hidden, and draws one static
   frame under `prefers-reduced-motion`. Any re-skin that keeps the figure
   must keep those three guards; the canvas is `aria-hidden` and the figure
   caption carries the meaning.
7. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` set to the page ground
   (`#0b0b0a` in v06), OG/Twitter card meta, SVG + 32 px + 180 px favicons,
   copyright year set by JS over a static fallback.
