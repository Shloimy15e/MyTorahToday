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
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    name => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports,
  );
  return module.exports;
}

const Link = ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children);
const Grid = ({ title, videos }) => React.createElement("section", null, title, videos.map(video => React.createElement("p", { key: video.id }, video.title)));
const NoResults = loadSource("src/app/(inner layout)/videos/search/NoResults.tsx", { "next/link": Link }).default;
const { default: Search, generateMetadata } = loadSource("src/app/(inner layout)/videos/search/page.tsx", {
  "next/link": Link,
  "next/headers": { cookies: async () => ({ get: () => undefined }) },
  "./NoResults": NoResults,
  "./SearchForm": () => React.createElement("form", { role: "search" }),
  "@/components/VideoGrid": Grid,
  "@/components/Error401": { Error401: () => React.createElement("section", { "data-login-gate": true }) },
  "@/data/videoData": { fetchTopicsServer: async () => [] },
});

function backend(t) {
  const previous = process.env.BACKEND_URL;
  process.env.BACKEND_URL = "https://backend.example";
  t.after(() => {
    if (previous === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = previous;
  });
}

test("results preserve exact query and filters, escape query text, and paginate with local links", async t => {
  backend(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ results: [{ id: 1, title: "A teaching" }], count: 61, next: "https://backend.example/api/videos/?offset=48" }));
  const query = '<script>alert("x")</script> & תפילה';
  const html = renderToStaticMarkup(await Search({ searchParams: Promise.resolve({ query, topic: "Torah & thought", subtopic: "A person's prayer", page: "2" }) }));
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url.searchParams.get("search"), query);
  assert.equal(url.searchParams.get("topic__name__iexact"), "Torah & thought");
  assert.equal(url.searchParams.get("subtopic__name__iexact"), "A person's prayer");
  assert.equal(url.searchParams.get("limit"), "24");
  assert.equal(url.searchParams.get("offset"), "24");
  assert.equal(options.cache, "no-store");
  assert.match(html, /61 videos/);
  assert.match(html, /Page 2/);
  assert.match(html, /page=3/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /href="https:\/\/backend/);
});

test("empty queries do not fetch videos and repeated query parameters are accepted safely", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("unexpected request"); });
  const html = renderToStaticMarkup(await Search({ searchParams: Promise.resolve({ query: ["   ", "ignored"] }) }));
  assert.match(html, /What would you like to learn/);
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal((await generateMetadata({ searchParams: Promise.resolve({ query: ["faith", "ignored"] }) })).title, 'Results for "faith" - My Torah Today');
});

test("failed HTTP, network, and malformed results show recovery instead of claiming no matches", async t => {
  backend(t);
  let mode = "http";
  t.mock.method(globalThis, "fetch", async () => {
    if (mode === "network") throw new Error("offline");
    return mode === "http" ? Response.json({ results: [] }, { status: 503 }) : Response.json({ results: null });
  });
  for (mode of ["http", "network", "malformed"]) {
    const html = renderToStaticMarkup(await Search({ searchParams: Promise.resolve({ query: "faith" }) }));
    assert.match(html, /couldn’t load these results/);
    assert.match(html, /Try again/);
    assert.doesNotMatch(html, /No matching videos/);
  }
});

function collection(token) {
  return loadSource("src/components/CollectionPage.tsx", {
    "next/link": Link,
    "next/headers": { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
    "./VideoGrid": Grid,
    "./Error401": { Error401: ({ title, description }) => React.createElement("section", { "data-login-gate": true }, title, description) },
  }).default;
}

test("signed-out collections show a truthful account gate without fetching private videos", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("private request"); });
  const CollectionPage = collection(null);
  for (const name of ["saved", "liked", "watched"]) {
    const html = renderToStaticMarkup(await CollectionPage({ collection: name }));
    assert.match(html, /data-login-gate/);
    assert.match(html, /Log in/);
    assert.doesNotMatch(html, /logged out successfully|No .*videos found/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("collections preserve per-user filters, token, no-store, and page offset", async t => {
  backend(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ results: [{ id: 1, title: "A teaching" }], next: "https://backend.example/private-next" }));
  const CollectionPage = collection("test-token");
  for (const [name, filter] of [["saved", "is_saved_by_user"], ["liked", "is_liked_by_user"], ["watched", "is_viewed_by_user"]]) {
    const html = renderToStaticMarkup(await CollectionPage({ collection: name, page: "2" }));
    const [url, options] = fetch.mock.calls.at(-1).arguments;
    assert.equal(url.searchParams.get(filter), "true");
    assert.equal(url.searchParams.get("offset"), "24");
    assert.equal(options.headers.Authorization, "Token test-token");
    assert.equal(options.cache, "no-store");
    assert.match(html, new RegExp("/videos/" + name + "\\?page=3"));
    assert.doesNotMatch(html, /private-next/);
  }
});

test("collection authentication errors, outages, and empty states remain distinct", async t => {
  backend(t);
  let status = 401;
  t.mock.method(globalThis, "fetch", async () => Response.json({ results: [] }, { status }));
  const CollectionPage = collection("expired-token");
  assert.match(renderToStaticMarkup(await CollectionPage({ collection: "saved" })), /data-login-gate/);
  status = 503;
  const unavailable = renderToStaticMarkup(await CollectionPage({ collection: "saved" }));
  assert.match(unavailable, /couldn’t load these videos/);
  assert.doesNotMatch(unavailable, /Use Save on any video/);
  status = 200;
  assert.match(renderToStaticMarkup(await CollectionPage({ collection: "saved" })), /Use Save on any video/);
});

function findElement(element, predicate) {
  if (!element || typeof element !== "object") return undefined;
  if (predicate(element)) return element;
  const children = React.Children.toArray(element.props?.children);
  for (const child of children) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
}

function authHarness(component, signIn) {
  const values = [];
  let cursor = 0;
  const calls = { closed: 0, refreshed: 0, reset: 0 };
  const hooks = {
    ...React,
    useId: () => "auth-test",
    useRef: initial => ({ current: initial }),
    useCallback: fn => fn,
    useEffect() {},
    useState(initial) {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], value => { values[index] = typeof value === "function" ? value(values[index]) : value; }];
    },
  };
  const passthrough = ({ children }) => children;
  const mocks = {
    react: hooks,
    "@headlessui/react": Object.fromEntries(["Description", "Dialog", "DialogBackdrop", "DialogPanel", "DialogTitle"].map(name => [name, passthrough])),
    "react-hook-form": { useForm: () => ({ register: () => ({}), handleSubmit: callback => callback, reset: () => calls.reset++, formState: { errors: {} } }) },
    "next-auth/react": { signIn },
    "next/navigation": { useRouter: () => ({ refresh: () => calls.refreshed++ }) },
    "@/context/ToastProvider": { useToast: () => ({ showToast() {} }) },
    "../context/ToastProvider": { useToast: () => ({ showToast() {} }) },
    "framer-motion": { motion: { div: "motion.div" }, useReducedMotion: () => false },
    "./ui/ScrollArea.module.css": { scrollbar: "scrollbar" },
    "./ui/LoginForm": { LoginForm: () => null },
  };
  const loaded = loadSource(component, mocks);
  const Component = loaded.default || loaded.LoginForm;
  const harness = {
    calls,
    render() { cursor = 0; return Component({ isOpen: true, onClose: () => calls.closed++ }); },
    submit(data) { return findElement(harness.render(), element => element.type === "form").props.onSubmit(data); },
    error() { return findElement(harness.render(), element => element.props?.role === "alert")?.props.children; },
  };
  return harness;
}

test("login catches a rejected request, restores submit, and preserves credential contract on retry", async () => {
  let reject = true;
  const requests = [];
  const harness = authHarness("src/components/ui/LoginForm.tsx", async (...args) => {
    requests.push(args);
    if (reject) throw new Error("offline");
    return { error: null };
  });
  const data = { username: "learner", password: "password123" };
  await harness.submit(data);
  assert.match(harness.error(), /couldn’t connect/);
  assert.equal(harness.calls.closed, 0);
  assert.equal(findElement(harness.render(), element => element.props?.type === "submit").props.disabled, false);
  reject = false;
  await harness.submit(data);
  assert.deepEqual(requests[1], ["credentials", { ...data, redirect: false }]);
  assert.equal(harness.calls.closed, 1);
  assert.equal(harness.calls.refreshed, 1);
});

test("signup keeps server errors visible and retries automatic login without creating a second account", async t => {
  let createOk = false;
  const fetch = t.mock.method(globalThis, "fetch", async () => createOk
    ? Response.json({ id: 1 })
    : Response.json({ error: { username: ["A user with that username already exists."] } }, { status: 400 }));
  let loginOk = false;
  const harness = authHarness("src/components/SignupDialog.tsx", async () => ({ error: loginOk ? null : "invalid" }));
  const data = { username: "learner", email: "", password: "password123", confirmPassword: "password123" };
  await harness.submit(data);
  assert.match(harness.error(), /already exists/);
  assert.equal(harness.calls.closed, 0);
  createOk = true;
  await harness.submit(data);
  assert.match(harness.error(), /account was created/);
  assert.equal(fetch.mock.callCount(), 2);
  loginOk = true;
  await harness.submit(data);
  assert.equal(fetch.mock.callCount(), 2);
  assert.equal(harness.calls.closed, 1);
  assert.equal(harness.calls.refreshed, 1);
  assert.equal(harness.calls.reset, 1);
});

test("signup reports an account already created when its automatic login request throws", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ id: 1 }));
  const harness = authHarness("src/components/SignupDialog.tsx", async () => { throw new Error("offline"); });
  await harness.submit({ username: "learner", email: "", password: "password123", confirmPassword: "password123" });
  assert.match(harness.error(), /account was created/);
  assert.equal(harness.calls.closed, 0);
});

test("search forwards an existing account token and exposes session renewal for expired credentials", async t => {
  backend(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}, { status: 401 }));
  const AuthenticatedSearch = loadSource("src/app/(inner layout)/videos/search/page.tsx", {
    "next/link": Link,
    "next/headers": { cookies: async () => ({ get: () => ({ value: "existing-token" }) }) },
    "./NoResults": NoResults,
    "./SearchForm": () => null,
    "@/components/VideoGrid": Grid,
    "@/components/Error401": { Error401: () => React.createElement("section", { "data-login-gate": true }) },
    "@/data/videoData": { fetchTopicsServer: async () => [] },
  }).default;
  const html = renderToStaticMarkup(await AuthenticatedSearch({ searchParams: Promise.resolve({ query: "faith" }) }));
  assert.equal(fetch.mock.calls[0].arguments[1].headers.Authorization, "Token existing-token");
  assert.match(html, /data-login-gate/);
  assert.doesNotMatch(html, /No matching videos|Search is taking a pause/);
});

test("a search page past the end offers the first page with the same query and filters", async t => {
  backend(t);
  t.mock.method(globalThis, "fetch", async () => Response.json({ results: [], next: null, count: 1 }));
  const html = renderToStaticMarkup(await Search({ searchParams: Promise.resolve({ query: "faith", topic: "Prayer", page: "20" }) }));
  assert.match(html, /You’ve reached the end/);
  assert.match(html, /href="\/videos\/search\?query=faith&amp;topic=Prayer"/);
  assert.match(html, /Back to the first page/);
});
