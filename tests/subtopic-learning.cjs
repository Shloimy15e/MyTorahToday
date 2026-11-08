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
const element = (tag) => ({ children, ...props }) => React.createElement(tag, props, children);
const video = (id) => ({ id, video_id: `video-${id}`, title: `Teaching ${id}`, duration: 'PT57S', is_saved_by_user: false });

test('durations are readable for short teachings and retain hours for longer recordings', () => {
  const format = loadSource('src/utils/formatDuration.ts').default;
  assert.equal(format('PT57S'), '0:57');
  assert.equal(format('PT14M43S'), '14:43');
  assert.equal(format('PT1H2M3S'), '1:02:03');
});

function library(videos, featured) {
  const Library = loadSource('src/components/SubtopicVideoLibrary.tsx', {
    'next/image': ({ fill, priority, sizes, ...props }) => React.createElement('img', props),
    'next/link': element('a'),
    '@/utils/formatDuration': () => '0:00:57',
    './VideoEmbed': element('iframe'),
    './ui/SaveButton': () => null,
  }).default;
  return renderToStaticMarkup(React.createElement(Library, { videos, featured }));
}

test('featured teaching outside the returned list is visible without dropping the list', () => {
  const html = library([video(1), video(2)], video(200));
  assert.match(html, /Teaching 200/);
  assert.match(html, /aria-label="Watch Teaching 1"/);
  assert.match(html, /aria-label="Watch Teaching 2"/);
  assert.doesNotMatch(html, /<iframe/);
});

test('featured teaching is not repeated, and an uncurated topic still has a starting point', () => {
  const html = library([video(1), video(2)], video(1));
  assert.equal((html.match(/href="\/videos\/1"/g) || []).length, 1);
  assert.match(library([video(2)], null), /A moment of learning/);
  assert.equal(library([], null), '');
});

test('explicit autoplay false stops automatic playback; intentional playback remains available', () => {
  const Embed = loadSource('src/components/VideoEmbed.tsx').default;
  const markup = autoplay => renderToStaticMarkup(React.createElement(Embed, { src: 'sample', className: '', autoplay, title: 'Sample lesson' }));
  assert.match(markup(false), /autoplay=0/);
  assert.match(markup(true), /autoplay=1/);
  assert.match(markup(undefined), /autoplay=1/);
  assert.match(markup(false), /title="Sample lesson"/);
});

function pageModule(subtopic, videos) {
  const ReactMock = { ...React, cache: fn => fn };
  return loadSource('src/app/(inner layout)/subtopics/[subtopicId]/page.tsx', {
    react: ReactMock,
    'next/headers': { cookies: async () => ({ get: () => undefined }) },
    'next/navigation': { notFound: () => { throw new Error('not-found'); } },
    'next/font/google': { Libre_Caslon_Display: () => ({ variable: 'test-display-font' }), Frank_Ruhl_Libre: () => ({ variable: 'test-source-font' }) },
    '@/styles/fonts': { displayFont: { variable: 'test-display-font' }, sourceFont: { variable: 'test-source-font' } },
    'next/link': element('a'),
    '@/data/videoData': { fetchSubtopicServer: async () => subtopic, getSubtopicLibraryServer: async () => videos },
    '@/data/sourceText': loadSource('src/data/sourceText.ts'),
    '@/components/Breadcrumbs': () => null,
    '@/components/Error401': { Error401: () => React.createElement('p', null, 'Please sign in again') },
    '@/components/JournalSection': () => React.createElement('div', { id: 'journal' }),
    '@/components/SefariaText': ({ text }) => React.createElement('div', null, text.join('|')),
    '@/components/SubtopicVideoLibrary': ({ featured }) => React.createElement('div', { id: 'watch' }, featured?.title || 'Video library'),
  });
}
const sample = { id: 7, name: 'An ordinary subject', topic: 2, topic_name: 'Learning', description: 'A useful introduction.', journals: [], sefaria_text: 'Sample source' };

async function resolveAsyncComponents(node) {
  if (Array.isArray(node)) return React.Children.toArray(await Promise.all(node.map(resolveAsyncComponents)));
  if (!React.isValidElement(node)) return node;
  if (typeof node.type === 'function' && node.type.constructor.name === 'AsyncFunction') {
    return resolveAsyncComponents(await node.type(node.props));
  }
  return React.cloneElement(node, {}, await resolveAsyncComponents(node.props.children));
}

async function renderPage(page) {
  return renderToStaticMarkup(await resolveAsyncComponents(await page.default({ params: Promise.resolve({ subtopicId: '7' }) })));
}

test('source outage preserves the video library and hides unavailable reading navigation', async () => {
  const previous = global.fetch;
  global.fetch = async () => { throw new Error('Source offline'); };
  try {
    const page = pageModule(sample, [video(1)]);
    const html = await renderPage(page);
    assert.match(html, /Video library/);
    assert.doesNotMatch(html, /href="#read"|href="#journal"/);
    assert.match(html, /A useful introduction/);
    const metadata = await page.generateMetadata({ params: Promise.resolve({ subtopicId: '7' }) });
    assert.equal(metadata.title, 'An ordinary subject - My Torah Today');
  } finally { global.fetch = previous; }
});

test('source response and journals connect to the generic subject; expanded feature works with an empty video page', async () => {
  const previous = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ ref: 'Sample source', versions: [{ text: [['one', 'two'], ['three']] }] }) });
  try {
    const page = pageModule({ ...sample, journals: [{ id: 1 }], featured_video: 200, featured_video_data: video(200) }, []);
    const html = await renderPage(page);
    assert.match(html, /Teaching 200/);
    assert.match(html, /href="#read"/);
    assert.match(html, /href="#journal"/);
    assert.match(html, /one\|two\|three/);
  } finally { global.fetch = previous; }
});

test('a subject with no available materials has an honest empty state', async () => {
  const previous = global.fetch;
  global.fetch = async () => ({ ok: false });
  try {
    const page = pageModule(sample, []);
    const html = await renderPage(page);
    assert.match(html, /There are no teachings or reading materials/);
    assert.doesNotMatch(html, /aria-label="Learning sections"/);
  } finally { global.fetch = previous; }
});

test('the introduction is optional, specific to the requested subject, and omitted for blank content', async () => {
  const previous = global.fetch;
  global.fetch = async () => ({ ok: false });
  try {
    for (const description of [null, '', '   ']) {
      const html = await renderPage(pageModule({ ...sample, description }, [video(1)]));
      assert.doesNotMatch(html, /whitespace-pre-line/);
    }
    const html = await renderPage(pageModule({ ...sample, description: 'Only this subject’s introduction.' }, [video(1)]));
    assert.match(html, /Only this subject’s introduction/);
    assert.doesNotMatch(html, /A useful introduction/);
  } finally { global.fetch = previous; }
});

test('the page can return its watch content while source reading is still pending', async () => {
  const previous = global.fetch;
  let finishSource;
  global.fetch = () => new Promise(resolve => { finishSource = resolve; });
  try {
    const page = pageModule(sample, [video(1)]);
    const tree = await page.default({ params: Promise.resolve({ subtopicId: '7' }) });
    assert.ok(React.isValidElement(tree));
    finishSource({ ok: false });
    assert.match(renderToStaticMarkup(await resolveAsyncComponents(tree)), /Video library/);
  } finally { global.fetch = previous; }
});

test('the library follows pagination without forwarding a backend-provided URL or losing authentication', async () => {
  const previousFetch = global.fetch;
  const previousBackend = process.env.BACKEND_URL;
  const calls = [];
  process.env.BACKEND_URL = 'http://library.test';
  global.fetch = async (url, options) => {
    calls.push({ url: new URL(url), options });
    return { ok: true, json: async () => calls.length === 1
      ? { results: [video(1)], next: 'https://untrusted.example/next' }
      : { results: [video(2)], next: null } };
  };
  try {
    const discovery = loadSource('src/utils/discoveryOrder.ts');
    const data = loadSource('src/data/videoData.tsx', {
      '@/utils/discoveryOrder': discovery,
      '@/data/discoveryCalendar': loadSource('src/data/discoveryCalendar.ts', { '@/utils/discoveryOrder': discovery }),
    });
    const result = await data.getSubtopicLibraryServer(7, 'test-session');
    assert.deepEqual(result.map(item => item.id), [1, 2]);
    assert.equal(calls[1].url.origin, 'http://library.test');
    assert.equal(calls[1].url.searchParams.get('offset'), '1');
    assert.equal(calls[0].options.headers.Authorization, 'Token test-session');
    await data.fetchSubtopicServer(7, 'test-session');
    assert.equal(calls[2].options.headers.Authorization, 'Token test-session');
  } finally {
    global.fetch = previousFetch;
    if (previousBackend === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = previousBackend;
  }
});
