# Variant 25 — noir-refined

## What changed

**Theme (identical tokens to 24-noir-moss).** Ground `#0b0c0e`, cards `#141518`
(hover `#1a1c20`), hairline `rgba(255,255,255,.08)`, text `#e6e6e6`, muted
`#9aa0a6`, moss accent `#a8b33e` with a `#c8d64b` hover step. Every olive token
and the `#ab5249` hover are gone. `bg.gif` is dropped for a flat ground plus
`radial-gradient(ellipse at top, #15170f, #0b0c0e 60%)`. Buttons are outlined,
not filled; nav active state is a moss underline. Inter replaces Roboto; JetBrains
Mono sets the logo subtitle, footer line and inline code.

**Invisible upgrades, on top.** WebP `<picture>` with `loading="lazy"`,
`decoding="async"` and intrinsic `width`/`height` on all 15 photos; click-to-load
facades for all six embeds (LinkedIn, Spotify, four YouTube); IntersectionObserver
scroll-spy replacing the scroll handler; skip link; `:focus-visible` outline;
`prefers-reduced-motion`. Layout, spacing, markup order and copy are master's.

**Image payload:** 7,661 KB → 1,157 KB (−85%), and the page now loads zero
third-party iframes until clicked.

## Principle

A re-skin is the cheapest moment to pay off performance and accessibility debt —
nobody sees the difference except the browser.

## Keep / drop

**Keep.** Best-of-both: 24's look at a fraction of its weight.
