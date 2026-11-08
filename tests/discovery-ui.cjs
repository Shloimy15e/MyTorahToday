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
const link = ({ children, ...props }) => React.createElement('a', props, children);
const image = ({ fill, sizes, ...props }) => React.createElement('img', props);
const sample = { id: 42, video_id: 'youtube-id', title: 'A teaching', duration: 'PT12M', is_saved_by_user: false };

test('page errors offer recovery without exposing technical details or personal contact information', () => {
  const PageError = loadSource('src/components/PageError.tsx', { 'next/link': link }).default;
  const html = renderToStaticMarkup(React.createElement(PageError, { error: new Error('Private technical failure'), reset: () => {} }));
  assert.match(html, /This page couldn&#x27;t load/);
  assert.match(html, /Try again/);
  assert.match(html, /href="\/topics"/);
  assert.doesNotMatch(html, /Private technical failure|gmail|manually/);
});

test('teaching cards use the database route and keep saving outside the navigation link', () => {
  const Card = loadSource('src/components/VideoCard.tsx', {
    'next/link': link,
    'next/image': image,
    '@/utils/formatDuration': () => '12:00',
    './ui/SaveButton': ({ videoId }) => React.createElement('button', { 'data-video': videoId }, 'Save'),
  }).default;
  const html = renderToStaticMarkup(React.createElement(Card, { video: sample, onClick: () => { throw new Error('Unexpected modal'); } }));
  assert.match(html, /href="\/videos\/42"/);
  assert.doesNotMatch(html, /href="\/videos\/youtube-id"/);
  assert.match(html, /<h3[^>]*>A teaching<\/h3>/);
  assert.match(html, /<\/a><div[^>]*><button data-video="42">/);
  assert.doesNotMatch(html, /<h1|likes|views/);
});

test('video grids keep section headings and link categories to the correct route type', () => {
  const Grid = loadSource('src/components/VideoGrid.tsx', {
    'next/link': link,
    './VideoCard': ({ video }) => React.createElement('article', null, video.title),
  }).default;
  const render = topicVideos => renderToStaticMarkup(React.createElement(Grid, {
    videos: [sample], title: 'A subject', topic: 8, topic_name: 'A subject', showAll: false, topicVideos,
  }));
  assert.match(render(true), /href="\/topics\/8"/);
  assert.match(render(false), /href="\/subtopics\/8"/);
  assert.match(render(true), /<h2/);
  assert.doesNotMatch(render(true), /<h1/);
});

function home(data, discoveryContext = loadSource('src/utils/discoveryOrder.ts')) {
  return loadSource('src/app/(inner layout)/page.tsx', {
    '@/utils/discoveryOrder': discoveryContext,
    'next/link': link,
    'next/image': ({ priority, ...props }) => image(props),
    '@/utils/formatDuration': () => '12:00',
    'next/headers': { cookies: async () => ({ get: () => undefined }) },
    '@/data/videoData': data,
    '@/components/Error401': { Error401: () => React.createElement('p', null, 'Sign in again') },
    '@/components/VideoGrid': ({ title, videos }) => React.createElement('section', null, title, videos.map(video => React.createElement('p', { key: video.id }, video.title))),
    '@/components/TopicGrid': ({ topics }) => React.createElement('section', { id: 'topics' }, topics.map(topic => topic.name).join(', ')),
  }).default;
}

test('the home weekly calendar uses the shared Jerusalem civil date and bounded hourly caching', async t => {
  const fetch = t.mock.method(global, 'fetch', async () => ({ ok: false }));
  await home({ fetchTopicsServer: async () => [], getVideosByTopicsServer: async () => [] }, {
    discoveryCivilDate: () => '2026-09-12', DISCOVERY_TIME_ZONE: 'Asia/Jerusalem',
  })();
  const [input, options] = fetch.mock.calls[0].arguments;
  const url = new URL(input);
  assert.equal(url.searchParams.get('year'), '2026');
  assert.equal(url.searchParams.get('month'), '09');
  assert.equal(url.searchParams.get('day'), '12');
  assert.equal(url.searchParams.get('timezone'), 'Asia/Jerusalem');
  assert.equal(options.next.revalidate, 3600);
  assert.ok(options.signal instanceof AbortSignal);
});

test('an unavailable weekly calendar still leaves the home library usable', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false }));
  const Home = home({
    fetchTopicsServer: async () => [{ id: 1, name: 'Learning' }],
    getVideosByTopicsServer: async () => [sample],
    fetchSubtopicServerByName: async () => { throw new Error('Should not look up unavailable calendar'); },
  });
  const html = renderToStaticMarkup(await Home());
  assert.match(html, /Make time/);
  assert.match(html, /id="topics"/);
  assert.match(html, /Learning/);
  assert.doesNotMatch(html, /This week.s parshah/);
});

test('the home opening uses real teaching data and does not repeat that teaching below', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false }));
  const Home = home({
    fetchTopicsServer: async () => [{ id: 1, name: 'Learning' }],
    getVideosByTopicsServer: async () => [sample, { ...sample, id: 43, title: 'Another teaching' }],
  });
  const html = renderToStaticMarkup(await Home());
  assert.match(html, /href="\/videos\/42"/);
  assert.match(html, /i.ytimg.com\/vi\/youtube-id\/hqdefault.jpg/);
  assert.match(html, /12:00/);
  assert.equal((html.match(/A teaching/g) || []).length, 1);
  assert.match(html, /Another teaching/);
});

test('the home opening follows the first ranked child with videos and skips empty children', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false }));
  const childRequests = [];
  const Home = home({
    fetchTopicsServer: async () => [{ id: 1, name: 'Learning', subtopics: [{ id: 9, name: 'Current but empty' }, { id: 8, name: 'Next relevant' }, { id: 7, name: 'Later' }] }],
    getVideosBySubtopicsServer: async (ids, token, limit) => {
      childRequests.push(ids[0]);
      assert.equal(limit, 9);
      return ids[0] === 9 ? [] : [{ ...sample, id: 88, title: 'Relevant child teaching' }];
    },
    getVideosByTopicsServer: async () => { throw new Error('Broad topic videos should not override available ranked children'); },
  });
  const html = renderToStaticMarkup(await Home());
  assert.deepEqual(childRequests, [9, 8]);
  assert.match(html, /href="\/videos\/88"/);
  assert.match(html, /Relevant child teaching/);
});

test('the home opening uses the first ranked child immediately and falls back to the topic when every child is empty', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false }));
  const broadRequests = [], childRequests = [];
  const Home = home({
    fetchTopicsServer: async () => [
      { id: 1, name: 'First topic', subtopics: [{ id: 11 }, { id: 12 }] },
      { id: 2, name: 'Second topic', subtopics: [{ id: 21 }, { id: 22 }] },
    ],
    getVideosBySubtopicsServer: async ids => {
      childRequests.push(ids[0]);
      return ids[0] === 11 ? [{ ...sample, id: 111, title: 'First ranked teaching' }] : [];
    },
    getVideosByTopicsServer: async ids => {
      broadRequests.push(ids[0]);
      return [{ ...sample, id: 222, title: 'Broad fallback teaching' }];
    },
  });
  const html = renderToStaticMarkup(await Home());
  assert.deepEqual(childRequests, [11, 21, 22]);
  assert.deepEqual(broadRequests, [2]);
  assert.match(html, /href="\/videos\/111"/);
  assert.match(html, /Broad fallback teaching/);
});

test('home still offers topic discovery when there are no available teachings', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false }));
  const Home = home({ fetchTopicsServer: async () => [], getVideosByTopicsServer: async () => [] });
  const html = renderToStaticMarkup(await Home());
  assert.match(html, /href="#topics"/);
  assert.match(html, /id="topics"/);
  assert.doesNotMatch(html, /href="\/videos\/undefined"|Watch teaching/);
});

test('topics with no subtopics render an empty collection and retain their real metadata name', async () => {
  const topic = { id: 8, name: 'An actual topic', description: 'A focused introduction.' };
  const page = loadSource('src/app/(inner layout)/topics/[topicId]/page.tsx', {
    'next/headers': { cookies: async () => ({ get: () => undefined }) },
    '@/data/videoData': { fetchTopicServer: async () => topic, fetchSubtopicsServer: async () => [] },
    '@/components/Breadcrumbs': () => null,
    '@/components/Error401': { Error401: () => null },
    '@/components/ui/HeroWithTitle': ({ title }) => React.createElement('h1', null, title),
    '@/components/VideoGrid': () => null,
    '@/components/TopicGrid': ({ topics }) => React.createElement('p', null, topics.length ? 'Available' : 'Topics will appear here'),
  });
  const props = { params: Promise.resolve({ topicId: '8' }) };
  const html = renderToStaticMarkup(await page.default(props));
  assert.match(html, /An actual topic/);
  assert.match(html, /Topics will appear here/);
  assert.equal((await page.generateMetadata(props)).title, 'An actual topic - My Torah Today');
});
