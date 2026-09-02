# Carry-over — keep these in any future redesign

Six things this build is carrying that are easy to lose in a re-skin.

1. **Images.** All 15 photos are WebP `<picture>` with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. The hero portrait is preloaded with
   `fetchpriority="high"`. (v05 drops the animated hero background, `bg.webp`;
   the spine carries that motif instead. The asset is still in the repo.)
2. **Embeds.** All six embeds (LinkedIn, Spotify, four YouTube) are real live
   iframes — no click-to-play facades. They are now `loading="lazy"` and sit
   inside collapsed `<details>` entries, so the iframe is not created until the
   reader opens that entry. This supersedes the old eager-load choice and takes
   all six off the critical path without hiding anything behind a poster.
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text, `aria-expanded`/`aria-controls` on the menu buttons,
   Escape closes the drawer, skip link to main content. The spine animation is
   decorative and `aria-hidden`; under reduced motion it is static and fully
   drawn, and with JS off the CSS defaults already draw it.
4. **Scroll-spy.** IntersectionObserver drives the active nav state — no
   scroll handler. Chapters carry `data-nav`, so several chapters can share one
   nav link (Writing → Community, Reading → Interests).
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1); the lowest
   in this build is 6.9:1.
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` set to `#0b0c0e`, real
   `<h1>`, OG/Twitter cards, JS-set copyright year with a static fallback,
   valid list markup, a 32/180 px favicon pair plus an SVG mark, and a 1.6 KB
   header logo in place of the 489 KB `icon.png`. Icons ship as an inline SVG
   sprite (32 Font Awesome Free 6.4.2 glyphs, attribution comment retained) —
   no icon font is loaded.
