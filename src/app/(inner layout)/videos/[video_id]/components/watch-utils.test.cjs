const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

const filename = path.join(__dirname, "watch-utils.ts");
const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const loaded = { exports: {} };
new Function("module", "exports", outputText)(loaded, loaded.exports);
const { uniqueRelatedVideos, videoShareUrl } = loaded.exports;

test("related teachings keep their order and third result while excluding the current video and repeats", () => {
  const videos = [1, 2, 3, 4, 2, 5, 1].map((id) => ({ id }));
  assert.deepEqual(uniqueRelatedVideos(videos, 1).map((video) => video.id), [2, 3, 4, 5]);
  assert.equal(videos.length, 7);
});

test("an empty related library stays empty", () => {
  assert.deepEqual(uniqueRelatedVideos([], 1), []);
});

test("sharing uses the teaching database id and canonical video route at the supplied origin", () => {
  assert.equal(videoShareUrl(42, "https://mytorahtoday.com/"), "https://mytorahtoday.com/videos/42");
  assert.equal(videoShareUrl(7, "http://127.0.0.1:3127/topics/old-title"), "http://127.0.0.1:3127/videos/7");
});
