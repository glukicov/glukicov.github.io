# Carry-over — keep these in any future redesign

Six things this branch is carrying that are easy to lose in a re-skin.

1. **Images.** All 15 photos plus the header logo are WebP `<img>` with
   `loading="lazy"`, `decoding="async"` and intrinsic `width`/`height`:
   7,661 KB → 1,157 KB (−85%), no layout shift. The hero portrait is the one
   exception — it is `preload`ed with `fetchpriority="high"` and loads eagerly
   because it is the largest thing above the fold.
2. **Embeds load lazily.** All six embeds (LinkedIn, Spotify, four YouTube)
   are live iframes with `loading="lazy"` inside aspect boxes, so they keep
   their space in the layout but stay off the critical path. *(Changed in
   v04: they used to load eagerly by owner's choice. Revert the attribute if
   the owner prefers the old behaviour — the aspect boxes work either way.)*
3. **Accessibility.** `:focus-visible` outline, `prefers-reduced-motion`,
   real `alt` text, `aria-expanded`/`aria-controls` on the menu buttons,
   Escape and outside-tap close the drawer, skip link to main content, 40 px
   minimum tap targets.
4. **Scroll-spy.** IntersectionObserver drives the active nav state — no
   scroll handler.
5. **Contrast.** Every text/background pair meets WCAG AA (≥4.5:1); the
   lowest pair on this branch is 6.57:1.
6. **Hygiene.** Strict HTML5 parses with zero errors, viewport allows
   pinch-zoom (no `user-scalable=no`), `theme-color` set to `#0e1116`,
   `color-scheme: dark`, Open Graph and Twitter card meta, a real `<h1>`, a
   32 px favicon and a 180 px apple-touch-icon, and a JS copyright year with a
   static fallback.

Two more that arrived with v04 and are worth keeping:

7. **No cdnjs.** The ~30 icons are an inline SVG sprite of Font Awesome 6.4.2
   glyphs (CC BY 4.0, attributed in the markup). Adding an icon means adding
   one `<symbol>`, not a 200 KB webfont.
8. **`backdrop-filter` belongs on a pseudo-element.** Putting it on the
   sticky header itself makes the header the containing block for the fixed
   nav drawer, which then gets clipped to the header's height. `.top::before`
   carries the blur instead.
