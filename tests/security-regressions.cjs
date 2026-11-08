const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loadSource(relativePath, mocks = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    module,
    module.exports
  );
  return module.exports;
}

test("server-rendered Sefaria text never includes untrusted HTML before sanitization", () => {
  const SefariaText = loadSource("src/components/SefariaText.tsx").default;
  const html = renderToStaticMarkup(React.createElement(SefariaText, {
    title: "Torah text",
    text: ['<img src=x onerror="alert(1)"><script>alert(1)</script>', '<svg onload="alert(2)"></svg>'],
  }));
  assert.match(html, /Torah text/);
  assert.doesNotMatch(html, /<script|<img|onerror|onload|alert\(/);
});

test("patched selector parser supports Tailwind variants and nested selectors", async () => {
  const postcss = require("postcss");
  const tailwindcss = require("tailwindcss");
  const result = await postcss([tailwindcss({
    content: [{ raw: '<div class="hover:bg-blue-500 md:p-4 [&>span]:text-sm"></div>' }],
    corePlugins: { preflight: false },
  })]).process("@tailwind utilities;", { from: undefined });
  assert.match(result.css, /:hover/);
  assert.match(result.css, /min-width: 768px/);
  assert.match(result.css, />span/);
});

test("patched sharp loads its native library and processes an image", async () => {
  const sharp = require("sharp");
  const image = await sharp({ create: { width: 2, height: 3, channels: 3, background: "white" } }).png().toBuffer();
  const metadata = await sharp(image).metadata();
  assert.equal(metadata.width, 2);
  assert.equal(metadata.height, 3);
  assert.equal(metadata.format, "png");
});

test("patched glob discovers TypeScript sources and honors ignored paths", () => {
  const { globSync } = require("glob");
  const files = globSync("src/**/*.{ts,tsx}", {
    cwd: path.join(__dirname, ".."),
    ignore: ["src/app/api/**"],
  }).map((file) => file.replaceAll("\\", "/"));
  assert.ok(files.includes("src/components/SefariaText.tsx"));
  assert.ok(files.includes("src/components/VideoDialog.tsx"));
  assert.ok(files.every((file) => !file.startsWith("src/app/api/")));
});

test("an aborted glob request performs no directory traversal", async () => {
  const { glob } = require("glob");
  const controller = new AbortController();
  const reason = new Error("Traversal cancelled");
  controller.abort(reason);
  let directoryReads = 0;
  await assert.rejects(glob("src/**/*", {
    cwd: path.join(__dirname, ".."),
    signal: controller.signal,
    fs: {
      ...fs,
      readdir(...args) {
        directoryReads++;
        return fs.readdir(...args);
      },
    },
  }), (error) => error === reason);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(directoryReads, 0);
});

function logoutHandler(token) {
  return loadSource("src/app/api/auth/token/logout/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
  }).POST;
}

test("logout rejects a missing token without contacting the backend", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("unexpected fetch"); });
  const response = await logoutHandler(null)(new Request("https://example.com/logout", { method: "POST" }));
  assert.equal(response.status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});

test("successful logout expires the HTTP-only cookie through NextResponse", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  const response = await logoutHandler("test-token")(new Request("https://example.com/logout", { method: "POST" }));
  assert.equal(response.status, 200);
  assert.equal(fetch.mock.calls[0].arguments[1].headers.Authorization, "Token test-token");
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /^auth_token=;/);
  assert.match(cookie, /Path=\//i);
  assert.match(cookie, /Expires=Thu, 01 Jan 1970 00:00:00 GMT/i);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=strict/i);
  assert.equal(/; Secure/i.test(cookie), process.env.NODE_ENV === "production");
  assert.deepEqual(await response.json(), { message: "Logged out successfully" });
});

test("failed logout preserves the cookie and backend error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ detail: "Invalid token" }, { status: 401 }));
  const response = await logoutHandler("test-token")(new Request("https://example.com/logout", { method: "POST" }));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.deepEqual(await response.json(), { error: "Invalid token" });
});

test("failed logout retains the fallback for a non-JSON backend error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("upstream unavailable", { status: 502 }));
  const response = await logoutHandler("test-token")(new Request("https://example.com/logout", { method: "POST" }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.deepEqual(await response.json(), { error: "Unexpected server response" });
});
