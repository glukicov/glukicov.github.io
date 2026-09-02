# Carry-over — keep these in any future redesign

Six things this assembly is carrying that are easy to lose in a re-skin.

1. **Images.** All 15 photos are WebP `<img>` with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. v01 dropped the `<picture>` wrappers and the
   PNG/JPEG fallbacks — WebP has been universally supported since 2020 — so a
   plain `<img src="….webp">` is the pattern to keep. The hero animation is
   animated WebP (670 KB GIF → 269 KB), now a plain `background-image` rather
   than an `image-set()` with a GIF fallback. The hero portrait is preloaded
   with `fetchpriority="high"`.
2. **Embeds are live but lazy.** All six embeds (LinkedIn, Spotify, four
   YouTube) are real iframes by owner's choice — no facades — and all six
   carry `loading="lazy"` so they stay off the critical path. Their cards
   reserve height and paint a neutral surface so a slow or blocked third party
   does not read as an empty hole.
3. **Accessibility.** A real (visually hidden) `<h1>`, `:focus-visible`
   outline, `prefers-reduced-motion`, real `alt` text on every image,
   `aria-expanded`/`aria-controls` on the menu buttons, Escape *and* a
   backdrop tap close the drawer (with `body` scroll locked while it is open),
   skip link to main content, tap targets ≥40 px at touch widths.
4. **Scroll-spy.** IntersectionObserver drives the active nav state — no
   scroll handler.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1).
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` and `color-scheme: dark`
   set, canonical link, Open Graph + Twitter card meta, copyright year from
   JS with a static fallback. Icons are an inline `<symbol>` sprite of the 32
   Font Awesome Free 6.4.2 glyphs actually used (CC BY 4.0, attribution
   comment above the sprite) — no icon-font CDN. If you add an icon, add its
   symbol; do not re-add Font Awesome.
