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

test("third-party embeds load without an interaction gate", () => {
  const iframeSources = [...html.matchAll(/<iframe\b[^>]*\bsrc=/g)];
  assert.equal(iframeSources.length, 6, "Every external player should have a source");
  assert.doesNotMatch(html, /class="embed-gate"/);
  assert.doesNotMatch(html, /<iframe\b[^>]*loading="lazy"/);
});

test("below-the-fold cards use rendering containment", () => {
  assert.match(html, /\.art\s*\{[^}]*content-visibility:\s*auto;/s);
  assert.match(html, /contain-intrinsic-block-size:\s*auto\s+620px;/);
});
