const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

test("the portfolio map appears before the introduction", () => {
  assert.ok(
    html.indexOf('id="dag"') < html.indexOf('class="hero-grid"'),
    "Visitors should explore the pipeline before reading the about panel",
  );
});

test("third-party embeds load without an interaction gate", () => {
  const iframeSources = [...html.matchAll(/<iframe\b[^>]*\bsrc=/g)];
  assert.equal(iframeSources.length, 6, "Every external player should have a source");
  assert.doesNotMatch(html, /class="embed-gate"/);
  assert.doesNotMatch(html, /<iframe\b[^>]*loading="lazy"/);
});

test("video frames carry a full-resolution poster over the player", () => {
  const videos = [...html.matchAll(/youtube\.com\/embed\/([\w-]+)/g)].map(
    (match) => match[1],
  );
  assert.equal(videos.length, 4, "Every talk should embed a player");
  for (const id of videos) {
    assert.match(
      html,
      new RegExp(`vi_webp/${id}/maxresdefault\\.webp`),
      `${id} should be postered at 1280px, not YouTube's 480px still`,
    );
    assert.match(html, new RegExp(`vi/${id}/maxresdefault\\.jpg`));
    assert.match(
      html,
      new RegExp(`embed/${id}\\?[^"]*enablejsapi=1`),
      `${id} must report playback so its poster can step aside`,
    );
  }
  assert.match(html, /\.frame \.poster \{[^}]*pointer-events:\s*none;/s);
});

test("below-the-fold cards use rendering containment", () => {
  assert.match(html, /\.art\s*\{[^}]*content-visibility:\s*auto;/s);
  assert.match(html, /contain-intrinsic-block-size:\s*auto\s+620px;/);
});

test("two-column card grids never leave a hole in a row", () => {
  const promote =
    ".arts > :is(.wide, :nth-child(1 of :not(.wide)):nth-last-child(odd of :not(.wide)))";
  assert.ok(
    html.includes(`${promote} {`),
    "An odd number of regular cards must promote the first one to full width",
  );

  const grids = [...html.matchAll(/<div class="arts">([\s\S]*?)\n {10}<\/div>/g)];
  assert.ok(grids.length > 0, "The page should have card grids");
  for (const [, grid] of grids) {
    const wide = [...grid.matchAll(/<article\s+class="([^"]*)"/g)].map((match) =>
      match[1].split(/\s+/).includes("wide"),
    );
    // Mirror the CSS: with an odd count of regular cards, the first spans both columns.
    if (wide.filter((w) => !w).length % 2 === 1) wide[wide.indexOf(false)] = true;

    let halfWidthRun = 0;
    for (const w of [...wide, true]) {
      if (!w) halfWidthRun += 1;
      else {
        assert.equal(
          halfWidthRun % 2,
          0,
          `A grid of ${wide.length} cards leaves a half-empty row before a full-width card; move a wide card so every run is even`,
        );
        halfWidthRun = 0;
      }
    }
  }
});
