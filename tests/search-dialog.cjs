const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");

function loadSource(relativePath, mocks = {}, window = undefined) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports, window,
  );
  return module.exports;
}

test("video search forwards the query and exact filters without accepting arbitrary backend parameters", async (t) => {
  const backendUrl = process.env.BACKEND_URL;
  process.env.BACKEND_URL = "https://backend.example.com";
  t.after(() => {
    if (backendUrl === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = backendUrl;
  });
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ results: [] }));
  const { GET } = loadSource("src/app/api/videos/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => undefined }) },
    "@/utils/sanitizeInput": loadSource("src/utils/sanitizeInput.ts"),
  });
  const params = new URLSearchParams({ search: "  faith & תפילה  ", limit: "8", topic__name__iexact: "Torah & תפילה", subtopic__name__iexact: "A person's prayer", ordering: "-private", admin: "true" });
  await GET(new Request(`https://example.com/api/videos/?${params}`));
  const forwarded = new URL(fetch.mock.calls[0].arguments[0]).searchParams;
  assert.equal(forwarded.get("search"), "faith & תפילה");
  assert.equal(forwarded.get("limit"), "8");
  assert.equal(forwarded.get("topic__name__iexact"), "Torah & תפילה");
  assert.equal(forwarded.get("subtopic__name__iexact"), "A person's prayer");
  assert.equal(forwarded.get("ordering"), null);
  assert.equal(forwarded.get("admin"), null);
});

// Exercise the actual effect with controlled hooks and timers, including a fetch
// implementation that resolves after cancellation rather than honoring abort.
function searchHarness() {
  const states = [], effects = [], refs = [], timers = new Map();
  let stateIndex = 0, effectIndex = 0, refIndex = 0, nextTimer = 0;
  let pending = [];
  const hooks = {
    ...React,
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useRef(value) { const index = refIndex++; return refs[index] ||= { current: value }; },
    useEffect(effect, dependencies) {
      const index = effectIndex++;
      const old = effects[index];
      if (!old || dependencies.some((value, i) => !Object.is(value, old.dependencies[i]))) {
        pending.push(() => { old?.cleanup?.(); effects[index] = { dependencies, cleanup: effect() }; });
      }
    },
  };
  const SearchDialog = loadSource("src/components/SearchDialog.tsx", {
    react: hooks,
    "next/navigation": { useRouter: () => ({ push() {} }) },
    "next/image": () => null,
    "next/link": () => null,
    "@/utils/formatDuration": { __esModule: true, default: (value) => value },
    "./ui/SearchFilter": () => null,
  }, {
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  }).default;
  return {
    states,
    render(props = {}) {
      stateIndex = effectIndex = refIndex = 0;
      SearchDialog({ open: true, onClose() {}, topics: [], ...props });
      const work = pending; pending = []; work.forEach((run) => run());
    },
    setQuery(value) { states[0] = value; },
    fireTimer() { const [id, fn] = timers.entries().next().value; timers.delete(id); return fn(); },
    timerCount() { return timers.size; },
    cleanup() { effects.forEach((effect) => effect?.cleanup?.()); },
  };
}

test("search debounces input, cancels old work, and rejects late stale responses", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", (url, options) => new Promise((resolve) => requests.push({ url, options, resolve })));
  const harness = searchHarness();
  t.after(() => harness.cleanup());
  harness.render({ initialQuery: "faith" });
  harness.setQuery("hope");
  harness.render({ initialQuery: "faith" });
  assert.equal(harness.timerCount(), 1);
  assert.equal(requests.length, 0);
  const older = harness.fireTimer();
  assert.match(requests[0].url, /search=hope/);
  harness.setQuery("prayer");
  harness.render({ initialQuery: "faith" });
  assert.equal(requests[0].options.signal.aborted, true);
  const latest = harness.fireTimer();
  requests[1].resolve(Response.json({ results: [{ id: 2, title: "Prayer" }] }));
  await latest;
  requests[0].resolve(Response.json({ results: [{ id: 1, title: "Hope" }] }));
  await older;
  assert.equal(harness.states[3].status, "ready");
  assert.deepEqual(harness.states[3].videos.map((video) => video.id), [2]);
});

test("closing search cancels its pending request and empty searches never fetch", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("must not fetch"); });
  const harness = searchHarness();
  t.after(() => harness.cleanup());
  harness.render();
  assert.equal(harness.timerCount(), 0);
  harness.setQuery("faith");
  harness.render();
  assert.equal(harness.timerCount(), 1);
  harness.render({ open: false });
  assert.equal(harness.timerCount(), 0);
  assert.equal(fetch.mock.callCount(), 0);
});

test("authenticated palette searches retain the backend token scheme", async t => {
  const previous = process.env.BACKEND_URL;
  process.env.BACKEND_URL = "https://backend.example.com";
  t.after(() => previous === undefined ? delete process.env.BACKEND_URL : process.env.BACKEND_URL = previous);
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ results: [] }));
  const { GET } = loadSource("src/app/api/videos/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => ({ value: "sample-session" }) }) },
    "@/utils/sanitizeInput": loadSource("src/utils/sanitizeInput.ts"),
  });
  await GET(new Request("https://example.com/api/videos/?search=hello"));
  assert.equal(fetch.mock.calls[0].arguments[1].headers.Authorization, "Token sample-session");
});
