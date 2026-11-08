const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadSource(relativePath, mocks = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    name => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports,
  );
  return module.exports;
}
const { fetchSourceText } = loadSource('src/data/sourceText.ts');
const subject = { name: 'A subject', sefaria_text: 'Numbers 4:21-7:89' };

function sourceResponse(t, data) {
  return t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
}

test('spanning source groups retain their actual references and every segment', async t => {
  const fetch = sourceResponse(t, {
    ref: 'Numbers 4:21-7:89', heRef: 'במדבר ד׳:כ״א-ז׳:פ״ט',
    spanningRefs: ['Numbers 4:21-49', 'Numbers 5', 'Numbers 6', 'Numbers 7:1-89'],
    versions: [{ direction: 'rtl', language: 'he', text: [['one', 'two'], ['three'], ['four'], ['five', 'six']] }],
  });
  const source = await fetchSourceText(subject);
  assert.deepEqual(source.text, ['one', 'two', 'three', 'four', 'five', 'six']);
  assert.deepEqual(source.sections.map(section => section.ref), ['Numbers 4:21-49', 'Numbers 5', 'Numbers 6', 'Numbers 7:1-89']);
  assert.deepEqual(source.sections.flatMap(section => section.text), source.text);
  assert.equal(source.title, 'במדבר ד׳:כ״א-ז׳:פ״ט');
  assert.equal(source.direction, 'rtl');
  assert.equal(source.language, 'he');
  assert.equal(source.sourceUrl, 'https://www.sefaria.org/Numbers%204%3A21-7%3A89');
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url.searchParams.get('return_format'), 'strip_only_footnotes');
  assert.equal(options.next.revalidate, 86400);
  assert.ok(options.signal instanceof AbortSignal);
});

test('a non-biblical flat source uses its own reference, direction, and complete text', async t => {
  const fetch = sourceResponse(t, {
    ref: 'Pirkei Avot 1', heRef: 'פרקי אבות א׳',
    versions: [{ direction: 'ltr', language: 'en', text: ['First teaching', '', 'Second teaching'] }],
  });
  const source = await fetchSourceText({ name: 'Pirkei Avot 1', sefaria_text: null });
  assert.deepEqual(source.text, ['First teaching', 'Second teaching']);
  assert.equal(source.title, 'Pirkei Avot 1');
  assert.equal(source.direction, 'ltr');
  assert.equal(source.sections, undefined);
  assert.equal(fetch.mock.calls[0].arguments[0].pathname, '/api/v3/texts/Pirkei%20Avot%201');
});

test('a single text segment is retained', async t => {
  sourceResponse(t, { ref: 'Berakhot 2a:1', versions: [{ text: 'One complete segment' }] });
  assert.deepEqual((await fetchSourceText(subject)).text, ['One complete segment']);
});

test('uncertain or malformed section mapping retains the complete unlabelled source', async t => {
  const response = { versions: [{ text: [['one', 'two'], ['three']] }] };
  sourceResponse(t, response);
  for (const spanningRefs of [['Only one'], ['First', 'Second', 'Third'], ['First', 2]]) {
    response.spanningRefs = spanningRefs;
    const source = await fetchSourceText(subject);
    assert.deepEqual(source.text, ['one', 'two', 'three']);
    assert.equal(source.sections, undefined);
  }
});

test('missing and invalid source bodies return no reading', async t => {
  const response = { value: null };
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => response.value }));
  for (const value of [null, {}, { versions: [] }, { versions: [{ text: {} }] }, { versions: [{ text: ['', null, 42, ['  ']] }] }]) {
    response.value = value;
    assert.equal(await fetchSourceText(subject), null);
  }
});

test('a missing source, source outage, timeout, and invalid JSON leave reading unavailable', async t => {
  let failure = 'http';
  t.mock.method(globalThis, 'fetch', async () => {
    if (failure === 'outage') throw new Error('offline');
    if (failure === 'timeout') throw new DOMException('Timed out', 'TimeoutError');
    return { ok: failure !== 'http', json: async () => { throw new SyntaxError('Invalid JSON'); } };
  });
  for (failure of ['http', 'outage', 'timeout', 'json']) assert.equal(await fetchSourceText(subject), null);
});


const readerSections = [{ ref: 'Work 1', text: ['first', 'second'] }, { ref: 'Work 2', text: ['third', 'fourth', 'fifth'] }];
function renderReader(open) {
  const sanitized = [];
  let stateIndex = 0;
  const wrapper = tag => ({ children, as, ...props }) => React.createElement(as || tag, props, children);
  const Reader = loadSource('src/components/SefariaText.tsx', {
    react: { ...React, useState: () => [[true, open, '', 0][stateIndex++], () => {}], useEffect: () => {} },
    '@/utils/sourceSearch': loadSource('src/utils/sourceSearch.ts'),
    dompurify: { sanitize: text => { sanitized.push(text); return `sanitized-${text}`; } },
    '@headlessui/react': {
      Transition: ({ show, children }) => show ? children : null,
      TransitionChild: ({ children }) => children,
      Dialog: ({ children, onClose, ...props }) => React.createElement('div', { ...props, role: 'dialog' }, children),
      DialogPanel: wrapper('div'), DialogTitle: wrapper('h2'),
    },
  }).default;
  const previousParser = global.DOMParser;
  global.DOMParser = class { parseFromString(text) { return { body: { textContent: text } }; } };
  let html;
  try { html = renderToStaticMarkup(React.createElement(Reader, {
    title: 'A source', text: readerSections.flatMap(section => section.text), sections: readerSections,
    direction: 'rtl', language: 'he', sourceUrl: 'https://www.sefaria.org/Work', readerClassName: 'reading-font-variables',
  })); } finally { global.DOMParser = previousParser; }
  return { html, sanitized };
}

test('the closed reader shows only a three-paragraph sanitized preview', () => {
  const { html, sanitized } = renderReader(false);
  assert.deepEqual(sanitized, ['first', 'second', 'third']);
  for (const text of sanitized) assert.ok(html.includes(`sanitized-${text}`));
  assert.doesNotMatch(html, /fourth|fifth|role="dialog"|overflow-y-auto|max-h-/);
  assert.match(html, /Read full text/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /Open in Sefaria/);
  assert.match(html, /dir="rtl" lang="he"/);
});

test('the opened reader includes every sanitized segment and genuine reference in its dialog', () => {
  const { html, sanitized } = renderReader(true);
  assert.deepEqual(sanitized, ['first', 'second', 'third', 'fourth', 'fifth']);
  const dialog = html.slice(html.indexOf('role="dialog"'));
  for (const text of ['first', 'second', 'third', 'fourth', 'fifth']) assert.ok(dialog.includes(`sanitized-${text}`));
  for (const ref of ['Work 1', 'Work 2']) assert.ok(dialog.includes(ref));
  assert.match(html, /reading-font-variables/);
  assert.match(dialog, /Close source reader/);
  assert.match(dialog, /overflow-y-auto/);
  assert.doesNotMatch(html, /border-t|border-b/);
});

test('source search ignores Hebrew vowel marks, finds references, and wraps arrow navigation', () => {
  const { findSourceMatches, nextSourceMatch } = loadSource('src/utils/sourceSearch.ts');
  const passages = [
    { key: 'a', text: 'יְבָרֶכְךָ יְהֹוָה', reference: 'Numbers 6:24' },
    { key: 'b', text: 'A blessing for you', reference: 'Work 2:1' },
    { key: 'c', text: 'Another BLESSING', reference: 'Work 2:2' },
  ];
  assert.deepEqual(findSourceMatches(passages, 'יברכך'), ['a']);
  assert.deepEqual(findSourceMatches(passages, '6:24'), ['a']);
  assert.deepEqual(findSourceMatches(passages, 'blessing'), ['b', 'c']);
  assert.deepEqual(findSourceMatches(passages, ''), []);
  assert.equal(nextSourceMatch(1, 2, 1), 0);
  assert.equal(nextSourceMatch(0, 2, -1), 1);
  assert.equal(nextSourceMatch(0, 0, 1), 0);
});

test('integer section metadata gives exact segment references without shifting empty verses', async t => {
  sourceResponse(t, { ref: 'A Work 4:21-5:2', textDepth: 2, addressTypes: ['Perek', 'Pasuk'], spanningRefs: ['A Work 4:21-23', 'A Work 5'], versions: [{ text: [['one', '', 'three'], ['four', 'five']] }] });
  const source = await fetchSourceText(subject);
  assert.deepEqual(source.sections[0].references, ['A Work 4:21', 'A Work 4:23']);
  assert.deepEqual(source.sections[1].references, ['A Work 5:1', 'A Work 5:2']);
});
