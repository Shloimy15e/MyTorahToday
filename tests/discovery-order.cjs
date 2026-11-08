const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

function loadSource(relativePath, mocks = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    name => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports,
  );
  return module.exports;
}
const discovery = loadSource('src/utils/discoveryOrder.ts');
const { sortSubtopicsForDiscovery: sort, sortTopicsForDiscovery, getDiscoveryRank, discoveryCivilDate } = discovery;
const now = date => new Date(`${date}T12:00:00Z`);
const item = (name, rules = [], order = 0) => ({ name, order, discovery_schedule: rules });
const names = items => items.map(value => value.name);

test('weekly matches rank active then nearest upcoming, with priority before editorial ties', () => {
  const items = [item('Fallback', [], -100), item('Saturday', [{ weekdays: [6], priority: 100 }]), item('Tuesday', [{ weekdays: [2] }]), item('Sunday low', [{ weekdays: [0], priority: 2 }]), item('Sunday high', [{ weekdays: [0], priority: 20 }])];
  assert.deepEqual(names(sort(items, { now: now('2026-11-08') })), ['Sunday high', 'Sunday low', 'Tuesday', 'Saturday', 'Fallback']);
  assert.deepEqual(names(items)[0], 'Fallback');
});

test('rules are OR alternatives and their populated fields are AND predicates', () => {
  const date = now('2026-11-08');
  assert.equal(getDiscoveryRank(item('Combined', [{ weekdays: [0], gregorian_months: [12] }]), { now: date }).bucket, 2);
  assert.equal(getDiscoveryRank(item('Either', [{ weekdays: [1] }, { gregorian_months: [11] }]), { now: date }).bucket, 0);
  assert.equal(getDiscoveryRank(item('Outside window', [{ weekdays: [0], ends_on: '2026-11-07' }]), { now: date }).bucket, 2);
});

test('upcoming discovery includes day 14, excludes day 15, and handles Gregorian month/year rollover', () => {
  const context = { now: now('2026-12-31') };
  assert.deepEqual(getDiscoveryRank(item('January', [{ gregorian_months: [1] }]), context), { bucket: 1, days: 1, priority: 10 });
  assert.equal(getDiscoveryRank(item('Boundary', [{ starts_on: '2027-01-14', ends_on: '2027-01-14' }]), context).days, 14);
  assert.equal(getDiscoveryRank(item('Too far', [{ starts_on: '2027-01-15' }]), context).bucket, 2);
  assert.equal(getDiscoveryRank(item('Inclusive end', [{ starts_on: '2026-12-31', ends_on: '2026-12-31' }]), context).bucket, 0);
});

test('Hebrew monthly rules cross leap Adar months and distinguish ordinary Adar', () => {
  const adarI = item('First Adar', [{ hebrew_months: ['Adar I'], hebrew_days: [30] }]);
  const adarII = item('Second Adar', [{ hebrew_months: ['Adar II'], hebrew_days: [1] }]);
  assert.equal(getDiscoveryRank(adarI, { now: now('2024-03-10') }).bucket, 0);
  assert.equal(getDiscoveryRank(adarII, { now: now('2024-03-10') }).days, 1);
  assert.equal(getDiscoveryRank(adarII, { now: now('2024-03-11') }).bucket, 0);
  assert.equal(getDiscoveryRank(item('Ordinary Adar', [{ hebrew_months: ['Adar'], hebrew_days: [8] }]), { now: now('2023-03-01') }).bucket, 0);
  assert.equal(getDiscoveryRank(item('Ordinary only', [{ hebrew_months: ['Adar'] }]), { now: now('2024-03-11') }).bucket, 2);
});

test('Hebrew annual rules cross Elul into Tishri and Jerusalem date differs from UTC at midnight', () => {
  const rule = item('New year', [{ hebrew_months: ['Tishri'], hebrew_days: [1] }]);
  assert.equal(getDiscoveryRank(rule, { now: now('2026-09-11') }).days, 1);
  assert.equal(getDiscoveryRank(rule, { now: now('2026-09-12') }).bucket, 0);
  assert.equal(discoveryCivilDate(new Date('2026-09-11T21:30:00Z')), '2026-09-12');
  assert.equal(getDiscoveryRank(rule, { now: new Date('2026-09-11T21:30:00Z') }).bucket, 0);
});

test('parents inherit their most relevant child and children retain their own ordering', () => {
  const context = { now: now('2026-11-08') };
  const topics = [
    { ...item('Editorial first', [], -10), subtopics: [item('Unscheduled')] },
    { ...item('Parent', [], 10), subtopics: [item('Later', [{ weekdays: [2] }]), item('Today', [{ weekdays: [0], priority: 20 }])] },
    { ...item('Direct', [{ weekdays: [0], priority: 10 }]), subtopics: [] },
  ];
  const ordered = sortTopicsForDiscovery(topics, context);
  assert.deepEqual(names(ordered), ['Parent', 'Direct', 'Editorial first']);
  assert.deepEqual(names(ordered[0].subtopics), ['Today', 'Later']);
  assert.deepEqual(names(topics[1].subtopics), ['Later', 'Today']);
});

test('irrelevant and equal-ranked items use editorial order then stable names', () => {
  const topics = [item('Zulu', [], 1), item('Same', [], 0), item('Alpha', [], 1), item('Same', [], 0)];
  const ordered = sort(topics, { now: now('2026-11-08') });
  assert.deepEqual(names(ordered), ['Same', 'Same', 'Alpha', 'Zulu']);
  assert.equal(ordered[0], topics[1]);
  assert.equal(ordered[1], topics[3]);
});

test('calendar metadata and source references match generically, with calendar rule fields ANDed only today', () => {
  const context = { now: now('2026-11-08'), calendarRefs: ['Genesis 25:19-28:9'] };
  const current = item('Calendar rule', [{ calendar_refs: ['Genesis_25:19–28:9'], weekdays: [0] }]);
  const future = item('Future unsupported', [{ calendar_refs: ['Genesis 25:19-28:9'], weekdays: [1] }]);
  const different = item('Different', [{ calendar_refs: ['Exodus 1:1-2:1'] }]);
  const source = { ...item('Source'), sefaria_text: ' genesis  25:19-28:9 ' };
  assert.equal(getDiscoveryRank(current, context).bucket, 0);
  assert.equal(getDiscoveryRank(source, context).bucket, 0);
  assert.equal(getDiscoveryRank(future, context).bucket, 2);
  assert.equal(getDiscoveryRank(different, context).bucket, 2);
});

test('same-book scripture ranges overlap combined portions without matching different books or disjoint ranges', () => {
  const overlap = discovery.discoveryReferencesOverlap;
  assert.equal(overlap('Leviticus 12:1-15:33', 'Leviticus 12:1-13:59'), true);
  assert.equal(overlap('Numbers 30:2-36:13', 'Numbers 30:2-32:42'), true);
  assert.equal(overlap('Numbers 30:2-36:13', 'Numbers 33:1-36:13'), true);
  assert.equal(overlap('Genesis 25:19-28:9', 'Genesis 26:1-5'), true);
  assert.equal(overlap('Genesis 25:19-28:9', 'Genesis 28:10-32:3'), false);
  assert.equal(overlap('Genesis 25:19-28:9', 'Exodus 25:19-28:9'), false);
  assert.equal(overlap('Genesis 25:19-28:9', 'Genesis twenty-five'), false);
  assert.equal(overlap('Genesis 25:19-28:9', 'Genesis 28:9-25:19'), false);
  assert.equal(overlap('Genesis 25:19-28:9', 'Genesis 0:0-99:99'), false);
  assert.equal(getDiscoveryRank(item('Portion', [{ calendar_refs: ['Leviticus 12:1-13:59'] }]), {
    now: now('2026-11-08'), calendarRefs: ['Leviticus 12:1-15:33'],
  }).bucket, 0);
});

test('calendar outages preserve schedule ordering and fetch uses dated Jerusalem context with bounded cache/timeout', async (t) => {
  const { fetchDiscoveryCalendarRefs } = loadSource('src/data/discoveryCalendar.ts', { '@/utils/discoveryOrder': discovery });
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('unavailable'); });
  const calendarRefs = await fetchDiscoveryCalendarRefs(now('2026-11-08'));
  assert.deepEqual(calendarRefs, []);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url.searchParams.get('year'), '2026');
  assert.equal(url.searchParams.get('month'), '11');
  assert.equal(url.searchParams.get('day'), '08');
  assert.equal(url.searchParams.get('timezone'), 'Asia/Jerusalem');
  assert.equal(options.next.revalidate, 3600);
  assert.ok(options.signal instanceof AbortSignal);
  const ordered = sort([item('Fallback'), item('Scheduled', [{ weekdays: [0] }])], { now: now('2026-11-08'), calendarRefs });
  assert.deepEqual(names(ordered), ['Scheduled', 'Fallback']);
});

test('calendar responses extract only nonempty string refs', async (t) => {
  const { fetchDiscoveryCalendarRefs } = loadSource('src/data/discoveryCalendar.ts', { '@/utils/discoveryOrder': discovery });
  t.mock.method(globalThis, 'fetch', async () => Response.json({ calendar_items: [{ ref: 'Genesis 25:19-28:9' }, { ref: 42 }, {}, null, { ref: '' }] }));
  assert.deepEqual(await fetchDiscoveryCalendarRefs(now('2026-11-08')), ['Genesis 25:19-28:9']);
});

test('topics proxy preserves pagination and filters while sorting only the returned page', async (t) => {
  const backendUrl = process.env.BACKEND_URL;
  process.env.BACKEND_URL = 'https://backend.example.com';
  t.after(() => backendUrl === undefined ? delete process.env.BACKEND_URL : process.env.BACKEND_URL = backendUrl);
  const data = { count: 21, next: 'next-page', previous: 'previous-page', results: [{ ...item('Later', [], 2), subtopics: [] }, { ...item('First', [], 1), subtopics: [] }] };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(data));
  const { GET } = loadSource('src/app/api/topics/route.ts', {
    '@/utils/sanitizeInput': loadSource('src/utils/sanitizeInput.ts'),
    '@/utils/discoveryOrder': discovery,
    '@/data/discoveryCalendar': { fetchDiscoveryCalendarRefs: async () => [] },
  });
  const response = await GET(new Request('https://example.com/api/topics/?limit=2&offset=8&name__iexact=Sample'));
  const result = await response.json();
  assert.equal(result.count, 21);
  assert.equal(result.next, 'next-page');
  assert.equal(result.previous, 'previous-page');
  assert.deepEqual(names(result.results), ['First', 'Later']);
  const forwarded = new URL(fetch.mock.calls[0].arguments[0]);
  assert.equal(forwarded.searchParams.get('limit'), '2');
  assert.equal(forwarded.searchParams.get('offset'), '8');
  assert.equal(forwarded.searchParams.get('name__iexact'), 'Sample');
});

test('server discovery fetchers collect every page before sorting and construct their own pagination URLs', async (t) => {
  const backendUrl = process.env.BACKEND_URL;
  process.env.BACKEND_URL = 'https://backend.example.com';
  t.after(() => backendUrl === undefined ? delete process.env.BACKEND_URL : process.env.BACKEND_URL = backendUrl);
  const fetch = t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(input);
    const firstPage = url.searchParams.get('offset') === '0';
    const topic = url.pathname === '/api/topics/';
    const result = { ...item(firstPage ? 'Later' : 'First', [], firstPage ? 2 : 1), ...(topic ? { subtopics: [] } : {}) };
    return Response.json({ count: 2, next: firstPage ? 'https://untrusted.example.com/page' : null, results: [result] });
  });
  const data = loadSource('src/data/videoData.tsx', {
    '@/utils/discoveryOrder': discovery,
    '@/data/discoveryCalendar': { fetchDiscoveryCalendarRefs: async () => [] },
  });
  assert.deepEqual(names(await data.fetchTopicsServer()), ['First', 'Later']);
  assert.deepEqual(names(await data.fetchSubtopicsServer('27')), ['First', 'Later']);
  assert.equal(fetch.mock.callCount(), 4);
  for (const [index, call] of fetch.mock.calls.entries()) {
    const url = new URL(call.arguments[0]);
    assert.equal(url.origin, 'https://backend.example.com');
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(url.searchParams.get('offset'), String(index % 2));
    if (index >= 2) assert.equal(url.searchParams.get('topic'), '27');
  }
});
