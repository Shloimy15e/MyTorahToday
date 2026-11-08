const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

const filename = path.join(__dirname, "../src/app/api/sitemap/route.ts");
const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
});
const loaded = { exports: {} };
new Function("require", "module", "exports", outputText)(require, loaded, loaded.exports);
const { GET } = loaded.exports;

function backend(t) {
  const previous = process.env.BACKEND_URL;
  process.env.BACKEND_URL = "https://backend.example";
  t.after(() => {
    if (previous === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = previous;
  });
}

test("sitemap uses canonical database IDs, deduplicates routes, and paginates on the configured backend", async t => {
  backend(t);
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    calls.push(new URL(url));
    assert.equal(url.origin, "https://backend.example");
    assert.equal(url.searchParams.get("limit"), "100");
    if (url.pathname === "/api/topics/") {
      return Response.json(url.searchParams.get("offset") === "0"
        ? { results: [{ id: 1, subtopics: [{ id: 5 }] }], next: "https://untrusted.example/next", count: 2 }
        : { results: [{ id: 2, subtopics: [{ id: 5 }, { id: 6 }] }], next: null, count: 2 });
    }
    return Response.json(url.searchParams.get("offset") === "0"
      ? { results: [{ id: 42, video_id: "youtube-id" }], next: "https://untrusted.example/next", count: 3 }
      : { results: [{ id: 42, video_id: "youtube-id" }, { id: 43, video_id: "other-id" }], next: null, count: 3 });
  });
  const response = await GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, ["/", "/topics", "/topics/1", "/subtopics/5", "/topics/2", "/subtopics/6", "/videos/42", "/videos/43"].map(route => `https://mytorahtoday.com${route}`));
  assert.doesNotMatch(xml, /youtube-id/);
  assert.equal(calls.length, 4);
  assert.deepEqual(calls.filter(url => url.pathname === "/api/videos/").map(url => url.searchParams.get("offset")), ["0", "1"]);
});

test("upstream errors and incomplete or invalid pages fail without caching a partial sitemap", async t => {
  backend(t);
  let failure;
  t.mock.method(globalThis, "fetch", async url => {
    if (url.pathname === "/api/topics/") return Response.json({ results: [], next: null });
    if (failure === "http") return new Response("Unavailable", { status: 503 });
    if (failure === "network") throw new Error("offline");
    if (failure === "shape") return Response.json({ results: null });
    if (failure === "id") return Response.json({ results: [{ video_id: "youtube-id" }], next: null });
    if (failure === "incomplete") return Response.json({ results: [{ id: 1 }], count: 2, next: null });
    return Response.json({ results: [], next: "https://backend.example/next" });
  });
  for (failure of ["http", "network", "shape", "id", "incomplete", "stalled"]) {
    const response = await GET();
    assert.equal(response.status, 502, failure);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.doesNotMatch(await response.text(), /<urlset/);
  }
});
