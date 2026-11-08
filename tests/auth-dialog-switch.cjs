const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");

function load(file, mocks) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(name => mocks[name] ?? require(name), module, module.exports);
  return module.exports;
}

function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

function harness(file, extra = {}) {
  const states = [], effects = [], refs = [];
  let si = 0, ei = 0, ri = 0, pending = [];
  const hooks = {
    ...React,
    useCallback: fn => fn,
    useState(value) { const i = si++; if (!(i in states)) states[i] = value; return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; },
    useRef(value) { const i = ri++; return refs[i] ||= { current: value }; },
    useId: () => "auth",
    useEffect(fn, deps) { const i = ei++; if (!effects[i] || deps.some((v, j) => v !== effects[i][j])) pending.push(fn); effects[i] = deps; },
  };
  const LoginForm = () => null;
  const mocks = {
    react: hooks,
    "@headlessui/react": Object.fromEntries(["Description", "Dialog", "DialogBackdrop", "DialogPanel", "DialogTitle"].map(n => [n, n])),
    "@heroicons/react/24/outline": { EyeIcon: "eye", EyeSlashIcon: "eye-off", XMarkIcon: "close" },
    "react-hook-form": { useForm: () => ({ register: () => ({}), handleSubmit: fn => fn, reset() {}, formState: { errors: {} } }) },
    "../context/ToastProvider": { useToast: () => ({ showToast() {} }) },
    "@/context/ToastProvider": { useToast: () => ({ showToast() {} }) },
    "next/navigation": { useRouter: () => ({ refresh() {} }) },
    "next-auth/react": { signIn: async () => ({ error: "retry" }) },
    "framer-motion": { motion: { div: "motion.div" }, useReducedMotion: () => false },
    "./ui/ScrollArea.module.css": { scrollbar: "scrollbar" },
    "./ui/LoginForm": { LoginForm },
    ...extra,
  };
  const exports = load(file, mocks);
  const Component = exports.default || exports.LoginForm;
  return {
    LoginForm, refs,
    render(props) {
      let tree;
      for (let pass = 0; pass < 2; pass++) {
        si = ei = ri = 0; tree = Component(props);
        const work = pending; pending = []; work.forEach(fn => fn());
      }
      return tree;
    },
  };
}

test("login entry switches both ways inside one dialog and restores its initial mode on reopening", () => {
  const h = harness("src/components/SignupDialog.tsx");
  const props = { isOpen: true, onClose() {}, initialView: "login" };
  let tree = h.render(props);
  assert.equal(nodes(tree).filter(n => n.type === "Dialog").length, 1);
  let focused = 0;
  h.refs[0].current = { focus: () => focused++ };
  nodes(tree).find(n => n.type === h.LoginForm).props.onSignup();
  tree = h.render(props);
  assert.equal(nodes(tree).filter(n => n.type === "form").length, 1);
  assert.equal(nodes(tree).filter(n => n.type === "Dialog").length, 1);
  assert.ok(focused > 0);
  nodes(tree).find(n => n.type === "button" && n.props.type === "button" && n.props.children === "Log in").props.onClick();
  tree = h.render(props);
  assert.ok(nodes(tree).find(n => n.type === h.LoginForm));
  nodes(tree).find(n => n.type === h.LoginForm).props.onSignup();
  h.render(props);
  h.render({ ...props, isOpen: false });
  tree = h.render(props);
  assert.ok(nodes(tree).find(n => n.type === h.LoginForm));
});

test("created-account retry survives switching and never posts a duplicate registration", async t => {
  let posts = 0, attempts = 0;
  t.mock.method(globalThis, "fetch", async () => { posts++; return { ok: true }; });
  const h = harness("src/components/SignupDialog.tsx", { "next-auth/react": { signIn: async () => { attempts++; return { error: "retry" }; } } });
  const props = { isOpen: true, onClose() {} };
  let tree = h.render(props);
  const data = { username: "reader", email: "", password: "safePass123", confirmPassword: "safePass123" };
  const request = nodes(tree).find(n => n.type === "form").props.onSubmit(data);
  tree = h.render(props);
  assert.equal(nodes(tree).find(n => n.type === "button" && n.props.type === "button" && n.props.children === "Log in").props.disabled, true);
  await request;
  tree = h.render(props);
  nodes(tree).find(n => n.type === "button" && n.props.type === "button" && n.props.children === "Log in").props.onClick();
  tree = h.render(props);
  nodes(tree).find(n => n.type === h.LoginForm).props.onSignup();
  tree = h.render(props);
  await nodes(tree).find(n => n.type === "form").props.onSubmit(data);
  assert.equal(posts, 1);
  assert.equal(attempts, 2);
});

test("create-account action is disabled while credentials are being checked", async () => {
  let resolve;
  const h = harness("src/components/ui/LoginForm.tsx", { "next-auth/react": { signIn: () => new Promise(done => { resolve = done; }) } });
  const props = { onClose() {}, onSignup() {} };
  let tree = h.render(props);
  const request = tree.props.onSubmit({ username: "reader", password: "password" });
  tree = h.render(props);
  assert.equal(nodes(tree).find(n => n.type === "button" && n.props.children === "Create an account").props.disabled, true);
  resolve({ error: "retry" });
  await request;
  tree = h.render(props);
  assert.equal(nodes(tree).find(n => n.type === "button" && n.props.children === "Create an account").props.disabled, false);
});

test("dialog measures changing content without retaining an outgoing form, and reduced motion removes travel", t => {
  const previous = globalThis.ResizeObserver;
  let resize, disconnected = 0;
  globalThis.ResizeObserver = class {
    constructor(callback) { resize = callback; }
    observe() {}
    disconnect() { disconnected++; }
  };
  t.after(() => {
    if (previous === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = previous;
  });
  const h = harness("src/components/SignupDialog.tsx", {
    "framer-motion": { motion: { div: "motion.div" }, useReducedMotion: () => true },
  });
  const props = { isOpen: true, onClose() {}, initialView: "login" };
  let tree = h.render(props);
  const content = nodes(tree).find(n => n.type === "div" && n.props.className === "flow-root");
  const measure = Object.getOwnPropertyDescriptor(content.props, "ref")?.value || Object.getOwnPropertyDescriptor(content, "ref").value;
  const element = { offsetHeight: 360 };
  measure(element);
  tree = h.render(props);
  let motion = nodes(tree).filter(n => n.type === "motion.div");
  assert.equal(motion[0].props.animate.height, 360);
  assert.equal(motion[0].props.transition.duration, 0);
  assert.equal(motion[1].props.initial.y, 0);
  assert.equal(motion[1].props.initial.opacity, 1);
  nodes(tree).find(n => n.type === h.LoginForm).props.onSignup();
  element.offsetHeight = 590;
  resize();
  tree = h.render(props);
  assert.equal(nodes(tree).filter(n => n.type === "motion.div")[0].props.animate.height, 590);
  assert.equal(nodes(tree).filter(n => n.type === "form").length, 1);
  assert.equal(nodes(tree).filter(n => n.type === h.LoginForm).length, 0);
  measure(null);
  assert.equal(disconnected, 1);
});
