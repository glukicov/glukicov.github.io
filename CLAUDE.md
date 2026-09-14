# glukicov.github.io

A single-page portfolio: everything lives in `index.html` (inline CSS and JS).

## Tests

```bash
node --test tests/*.cjs
```

## Two-column card grids

Every `<div class="arts">` is two columns wide on desktop, and no row may be left
half empty.

- An even number of regular cards tiles on its own.
- An odd number of regular cards: the **first** regular card spans both columns.
  This is automatic. The CSS rule under `@media (min-width: 860px)` promotes it,
  so do not add or remove `wide` classes to balance a grid after adding a card.
- Add `class="art wide"` only for a card that should be full width on its own
  merits. Wide cards split the grid into runs, and each run of regular cards
  between them must still come out even.
- `tests/site-structure.test.cjs` ("never leave a hole in a row") replays the
  rule over every grid and fails if any row would be half empty.
