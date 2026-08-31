# Final — noir-moss assembly

The shipping build: **variant 24's theme + variant 25's optimisation layer +
the hero animation restored.**

**Theme (24).** Noir ground `#0b0c0e`, cards `#141518`, hairline borders, moss
accent `#a8b33e`, Inter plus JetBrains Mono for the logo subtitle, footer line,
code and card buttons. Nav links `nowrap` at 0.4rem padding, six on one line.

**Optimisation (25).** WebP pictures (−85% payload), eager
embeds (owner's choice), IntersectionObserver scroll-spy, skip link, `:focus-visible`,
`prefers-reduced-motion`.

**Hero animation (master/23).** Back on `.hero` only, as animated WebP via
`image-set()` with the GIF as fallback (670→269 KB), under 23's near-black
`linear-gradient(135deg, rgba(11,12,14,.82), rgba(11,12,14,.92))` so it ghosts
through. The footer stays flat noir.

Plus: strict-HTML fixes, pinch-zoom re-enabled, `theme-color`, Escape closes
the mobile drawer. See CARRYOVER.md.
