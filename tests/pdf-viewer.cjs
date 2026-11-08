const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');

function readerHarness() {
  const states = [];
  const effects = [];
  const tasks = [];
  const refs = [];
  let cursor = 0;
  let refCursor = 0;
  const react = { ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect(fn) { effects.push(fn); },
    useRef() { const index = refCursor++; return refs[index] ||= { current: null }; },
  };
  const pdfjs = { GlobalWorkerOptions: {}, getDocument() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    const task = { promise, resolve, reject, destroyed: false, destroy() { this.destroyed = true; return Promise.resolve(); } };
    tasks.push(task);
    return task;
  } };
  const source = fs.readFileSync(path.join(__dirname, '../src/components/PdfViewer.tsx'), 'utf8').replaceAll('import.meta.url', '"file:///pdf-viewer.js"');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(name => name === 'react' ? react : name === 'react-pdf' ? { Page: () => null, pdfjs } : require(name), module, module.exports);
  const boundary = module.exports.default({ url: '/sample.pdf' });
  const reader = boundary.props.children.type;
  return { states, effects, tasks, refs, boundary, render() { cursor = 0; refCursor = 0; return reader({ url: '/sample.pdf', title: 'Test journal' }); } };
}

function findElement(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => findElement(child, predicate));
  if (!React.isValidElement(node)) return [];
  return [...(predicate(node) ? [node] : []), ...findElement(node.props.children, predicate)];
}

test('StrictMode effect cleanup cannot publish its destroyed document', async () => {
  const harness = readerHarness();
  harness.render();
  const cleanupFirst = harness.effects[0]();
  cleanupFirst();
  const cleanupSecond = harness.effects[0]();
  const destroyedDocument = { numPages: 2 };
  harness.tasks[0].resolve(destroyedDocument);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(harness.tasks[0].destroyed, true);
  assert.equal(harness.states[0], null);
  const liveDocument = { numPages: 3 };
  harness.tasks[1].resolve(liveDocument);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(harness.states[0], liveDocument);
  cleanupSecond();
  assert.equal(harness.tasks[1].destroyed, true);
});

test('document failure stays inside the preview and destroyed loader failures are ignored', async () => {
  const harness = readerHarness();
  harness.render();
  const cleanup = harness.effects[0]();
  cleanup();
  harness.tasks[0].reject(new Error('Worker destroyed'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(harness.states[1], false);
  harness.effects[0]();
  harness.tasks[1].reject(new Error('PDF unavailable'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(harness.states[1], true);
  const { renderToStaticMarkup } = require('react-dom/server');
  assert.match(renderToStaticMarkup(harness.render()), /The preview is unavailable/);
});

test('a synchronous Page failure has a local fallback and changing URL resets its boundary', () => {
  const harness = readerHarness();
  const Boundary = harness.boundary.type;
  const boundary = new Boundary({ children: null });
  boundary.state = Boundary.getDerivedStateFromError(new Error('sendWithPromise'));
  const { renderToStaticMarkup } = require('react-dom/server');
  assert.match(renderToStaticMarkup(boundary.render()), /Open PDF or Save PDF/);
  assert.equal(harness.boundary.key, '/sample.pdf');
});

test('page controls stop at document bounds and zoom preserves the canvas width', () => {
  const harness = readerHarness();
  harness.states[0] = { numPages: 3 };
  harness.states[4] = 800;
  function find(node, predicate) {
    if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
    if (!React.isValidElement(node)) return [];
    return [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)];
  }
  const button = label => find(harness.render(), node => node.props['aria-label'] === label)[0];
  assert.equal(button('Previous page').props.disabled, true);
  button('Next page').props.onClick();
  button('Next page').props.onClick();
  assert.equal(harness.states[2], 3);
  assert.equal(button('Next page').props.disabled, true);
  const page = () => find(harness.render(), node => typeof node.type === 'function' && node.props.pageNumber)[0];
  const originalWidth = page().props.width;
  for (let index = 0; index < 8; index++) button('Zoom in').props.onClick();
  assert.equal(page().props.scale, 2.5);
  assert.equal(page().props.width, originalWidth);
  assert.equal(button('Zoom in').props.disabled, true);
  button('Fit journal to width').props.onClick();
  assert.equal(page().props.scale, 1);
});

test('arrow keys turn pages only inside the reader and preserve interactive controls', () => {
  const harness = readerHarness();
  harness.states[0] = { numPages: 3 };
  let prevented = 0;
  const key = (key, interactive = false, ctrlKey = false) => harness.render().props.onKeyDown({
    key, ctrlKey, target: { closest: () => interactive ? {} : null }, preventDefault() { prevented++; },
  });
  key('ArrowRight');
  assert.equal(harness.states[2], 2);
  key('ArrowRight', true);
  key('ArrowRight', false, true);
  key('ArrowDown');
  assert.equal(harness.states[2], 2);
  assert.equal(prevented, 1);
  key('ArrowLeft');
  assert.equal(harness.states[2], 1);
});

test('fullscreen state follows the browser, including Escape, and rejection keeps inline reading', async () => {
  const previous = global.document;
  const listeners = {};
  global.document = { fullscreenEnabled: true, fullscreenElement: null,
    addEventListener: (name, handler) => { listeners[name] = handler; },
    removeEventListener: name => { delete listeners[name]; },
    exitFullscreen: async () => { global.document.fullscreenElement = null; listeners.fullscreenchange(); },
  };
  try {
    const harness = readerHarness();
    harness.render();
    const container = { requestFullscreen: async () => { global.document.fullscreenElement = container; listeners.fullscreenchange(); } };
    harness.refs[0].current = container;
    const cleanup = harness.effects[2]();
    const button = label => findElement(harness.render(), node => node.props['aria-label'] === label)[0];
    await button('Read journal full screen').props.onClick();
    assert.equal(harness.states[5], true);
    await global.document.exitFullscreen();
    assert.equal(harness.states[5], false);
    container.requestFullscreen = async () => { throw new Error('Denied'); };
    await button('Read journal full screen').props.onClick();
    assert.equal(harness.states[5], false);
    assert.match(harness.states[7], /keep reading here/);
    cleanup();
    assert.equal(listeners.fullscreenchange, undefined);
  } finally { global.document = previous; }
});
