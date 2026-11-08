const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

test('returning to the top keeps the focused control enabled until smooth scrolling finishes', t => {
  const originalWindow = globalThis.window;
  t.after(() => originalWindow === undefined ? delete globalThis.window : globalThis.window = originalWindow);
  let visible = false;
  let onScroll;
  let requested;
  let reducedMotion = false;
  globalThis.window = {
    scrollY: 0,
    addEventListener: (name, callback) => { if (name === 'scroll') onScroll = callback; },
    removeEventListener: () => {},
    matchMedia: () => ({ matches: reducedMotion }),
    scrollTo: options => { requested = options; },
  };
  const hooks = {
    useState: initial => [initial, value => { visible = value; }],
    useRef: initial => ({ current: initial }),
    useEffect: callback => callback(),
  };
  const source = fs.readFileSync('src/components/ui/BackToTopButton.tsx', 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    name => name === 'react' ? hooks : require(name), module, module.exports,
  );
  const button = module.exports.default();
  const scroll = y => { window.scrollY = y; onScroll(); };

  scroll(200);
  assert.equal(visible, false);
  scroll(1000);
  assert.equal(visible, true);
  button.props.onClick();
  assert.deepEqual(requested, { top: 0, behavior: 'smooth' });
  scroll(200);
  assert.equal(visible, true);
  scroll(1);
  assert.equal(visible, true);
  scroll(0);
  assert.equal(visible, false);

  reducedMotion = true;
  scroll(1000);
  button.props.onClick();
  assert.deepEqual(requested, { top: 0, behavior: 'auto' });
  scroll(0);
  assert.equal(visible, false);
});
