# Carry-over — keep these in any future redesign

Six things this assembly is carrying that are easy to lose in a re-skin.
Updated for **v03 · Editorial**; the two points this variant changes are
marked.

1. **Images.** All 15 photos are WebP `<picture>` with `loading="lazy"`,
   `decoding="async"` and intrinsic `width`/`height`: 7,661 KB → 1,157 KB
   (−85%), no layout shift. The hero portrait is the one exception: it is
   above the fold, so it is `<link rel="preload">`ed with
   `fetchpriority="high"` and not lazy. *Changed in v03:* the animated-WebP
   hero background (269 KB) is gone — the network motif is now a CSS-only
   graph-paper grid behind the hero, costing nothing. If a photo is ever
   sized with `aspect-ratio`, it also needs `height: auto`, or the intrinsic
   `height` attribute wins and the image stretches.
2. **Embeds.** All six embeds (LinkedIn, Spotify, four YouTube) are live
   iframes, never facades. *Changed in v03:* every one of them is
   `loading="lazy"` — they are all below the fold, so this keeps them out of
   the critical path while still rendering with no click. Each also carries a
   `title`.
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text on every image, `aria-expanded`/`aria-controls` on the
   menu buttons, Escape closes the drawer, a backdrop that closes it on tap,
   focus returned to the menu button on close, skip link to main content, and
   an `aria-label` on the theme toggle that says which theme it switches to.
4. **Scroll-spy.** One IntersectionObserver drives the active state of both
   the header nav and the sticky rail table of contents — no scroll handler.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1), in the
   light theme and the dark one.
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` tracks the active theme
   (`#e9e9e4` / `#101214`) and is updated by the toggle, real favicon and
   apple-touch-icon, Open Graph and Twitter card meta, a visible `<h1>`, and
   a copyright year set by JS with a static fallback.
