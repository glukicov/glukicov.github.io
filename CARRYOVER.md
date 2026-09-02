# Carry-over — keep these in any future redesign

Six things this assembly is carrying that are easy to lose in a re-skin.
A seventh: **motion never hides content.** Nothing on this page rests at
`opacity: 0` waiting for an observer, and every animation is gated behind
`prefers-reduced-motion` — see `VARIANT.md`.

1. **Images.** All 15 photos are WebP `<picture>` with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. The hero animation is animated WebP via
   `image-set()` with the GIF as fallback: 670 KB → 269 KB (−60%).
2. **Embeds are live, and lazy.** All six embeds (LinkedIn, Spotify, four
   YouTube) are still real iframes by owner's choice, now with `loading="lazy"`
   and a `title`, so they stay off the critical path. Revisit facades only if
   load time still matters.
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text, `aria-expanded`/`aria-controls` on the menu buttons,
   Escape closes the drawer, skip link to main content, a visually-hidden
   `<h1>`, tap targets of at least 40 px.
4. **Scroll-spy.** IntersectionObserver drives the active nav state and the
   sliding nav indicator. The one scroll handler (header compaction, reading
   progress, back-to-top) is passive and rAF-throttled.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1).
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` set to `#0b0c0e`,
   `color-scheme: dark`, Open Graph and Twitter card meta, a 2.8 KB favicon
   and a 1.6 KB header logo (not the 489 KB `icon.png`), copyright year from
   JS with a static fallback.
