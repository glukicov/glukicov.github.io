# Carry-over — keep these in any future redesign

Six things this assembly is carrying that are easy to lose in a re-skin.

1. **Images.** All 15 photos are WebP `<picture>` with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. The hero animation is animated WebP via
   `image-set()` with the GIF as fallback: 670 KB → 269 KB (−60%).
2. **Embed facades.** All six embeds (LinkedIn, Spotify, four YouTube) are
   click-to-load posters. Zero third-party iframes until a user asks for one.
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text, `aria-expanded`/`aria-controls` on the menu buttons,
   Escape closes the drawer, skip link to main content.
4. **Scroll-spy.** IntersectionObserver drives the active nav state — no
   scroll handler.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1).
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` set to `#0b0c0e`.
