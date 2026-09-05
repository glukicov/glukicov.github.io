const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((body) => body.includes("/* ---------- the DAG ---------- */"));
const source = script
  ?.split("/* ---------- the DAG ---------- */")[1]
  ?.split("/* ---------- terminal typing")[0];
assert.ok(source, "The page must contain the DAG script under test");

function eventTarget(properties = {}) {
  const listeners = new Map();
  return Object.assign(properties, {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(callback);
    },
    dispatch(type) {
      for (const callback of listeners.get(type) || []) callback({ type });
    },
  });
}

function fixture({ reduced = false } = {}) {
  const pending = new Map();
  let nextId = 0;
  let draws = 0;
  let intersection;
  let observedResize;
  let fontsReady;
  const reducedMotion = eventTarget({ matches: reduced });
  const mobile = eventTarget({ matches: false });
  const context2d = Object.fromEntries(
    [
      "setTransform",
      "beginPath",
      "moveTo",
      "lineTo",
      "bezierCurveTo",
      "quadraticCurveTo",
      "stroke",
      "setLineDash",
      "save",
      "restore",
      "translate",
      "rotate",
    ].map((name) => [name, () => {}]),
  );
  context2d.clearRect = () => draws++;
  const bounds = { left: 0, top: 0, bottom: 240, width: 1100, height: 240 };
  const box = {
    clientWidth: 1100,
    clientHeight: 240,
    getBoundingClientRect: () => bounds,
  };
  const canvas = { ...box, getContext: () => context2d };
  const nodes = [
    "physics",
    "outreach",
    "data",
    "platform",
    "interests",
    "community",
    "writing",
  ].map((name, index) =>
    eventTarget({
      dataset: { node: name, x: String((index + 1) / 8), y: "0.5" },
      offsetWidth: 100,
      offsetHeight: 44,
      hasAttribute: (attribute) =>
        attribute === "data-branch" && ["outreach", "interests"].includes(name),
      style: { setProperty() {}, removeProperty() {} },
      getBoundingClientRect: () => ({
        left: index * 130,
        top: 100,
        bottom: 144,
        width: 100,
        height: 44,
      }),
    }),
  );
  const document = eventTarget({
    hidden: false,
    fonts: {
      ready: {
        then(callback) {
          fontsReady = callback;
          return { catch() {} };
        },
      },
    },
  });
  const window = eventTarget({
    devicePixelRatio: 1,
    matchMedia: (query) =>
      query.includes("reduced-motion") ? reducedMotion : mobile,
    requestAnimationFrame(callback) {
      pending.set(++nextId, callback);
      return nextId;
    },
    cancelAnimationFrame(id) {
      pending.delete(id);
    },
    ResizeObserver: class {
      constructor(callback) {
        observedResize = callback;
      }
      observe() {}
    },
    IntersectionObserver: class {
      constructor(callback) {
        intersection = callback;
      }
      observe() {}
    },
  });
  vm.runInNewContext(
    source,
    {
      ...window,
      window,
      document,
      d: document,
      mq: reducedMotion,
      $: (selector) => (selector === "#dag-canvas" ? canvas : box),
      $$: () => nodes,
      getComputedStyle: () => ({ display: "block" }),
    },
    { filename: "index.html DAG script" },
  );
  return {
    pending,
    get draws() {
      return draws;
    },
    intersect(visible) {
      intersection([{ isIntersecting: visible }]);
    },
    resize() {
      window.dispatch("resize");
      observedResize([]);
    },
    fontsReady() {
      fontsReady();
    },
    hide(hidden) {
      document.hidden = hidden;
      document.dispatch("visibilitychange");
    },
    reduce(matches) {
      reducedMotion.matches = matches;
      reducedMotion.dispatch("change");
    },
    frame() {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(16));
    },
  };
}

test("resize and font readiness keep exactly one animation callback", () => {
  const page = fixture();
  page.intersect(true);
  for (let count = 0; count < 5; count++) page.resize();
  page.fontsReady();
  assert.equal(page.pending.size, 1);
  const before = page.draws;
  page.frame();
  assert.equal(page.draws - before, 1);
  assert.equal(page.pending.size, 1);
});

test("offscreen resize and font readiness cannot restart animation", () => {
  const page = fixture();
  page.intersect(true);
  page.intersect(false);
  page.resize();
  page.fontsReady();
  assert.equal(page.pending.size, 0);
  page.intersect(true);
  assert.equal(page.pending.size, 1);
});

test("hidden documents pause, and resume only while the graph is visible", () => {
  const page = fixture();
  page.intersect(true);
  page.hide(true);
  page.resize();
  assert.equal(page.pending.size, 0);
  page.hide(false);
  assert.equal(page.pending.size, 1);
  page.intersect(false);
  page.hide(true);
  page.hide(false);
  assert.equal(page.pending.size, 0);
});

test("reduced motion stays static and responds to preference changes", () => {
  const page = fixture({ reduced: true });
  page.intersect(true);
  page.resize();
  assert.ok(page.draws > 0, "Reduced motion must retain a rendered graph");
  assert.equal(page.pending.size, 0);
  page.reduce(false);
  assert.equal(page.pending.size, 1);
  page.reduce(true);
  assert.equal(page.pending.size, 0);
  page.intersect(false);
  page.reduce(false);
  assert.equal(page.pending.size, 0);
});
