const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

test("the introduction appears before the portfolio map", () => {
  assert.ok(
    html.indexOf('class="hero-grid hero-intro"') < html.indexOf('id="dag"'),
    "Visitors should meet Gleb before exploring the portfolio map",
  );
});

test("third-party embeds are opt-in", () => {
  const iframeSources = [...html.matchAll(/<iframe\b[^>]*\bsrc=/g)];
  const embedGates = [
    ...html.matchAll(
      /<button\b[^>]*class="embed-gate"[^>]*data-embed-src="[^"]+"[^>]*data-embed-title="[^"]+"[^>]*data-embed-provider="[^"]+"/g,
    ),
  ];

  assert.equal(iframeSources.length, 0, "No iframe should load on page startup");
  assert.equal(embedGates.length, 6, "Every external player should have a load gate");
});

test("below-the-fold cards use rendering containment", () => {
  assert.match(html, /\.art\s*\{[^}]*content-visibility:\s*auto;/s);
  assert.match(html, /contain-intrinsic-block-size:\s*auto\s+620px;/);
});
