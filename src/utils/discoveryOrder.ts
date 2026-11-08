export type DiscoveryRule = {
  weekdays?: number[];
  hebrew_months?: string[];
  hebrew_days?: number[];
  gregorian_months?: number[];
  starts_on?: string;
  ends_on?: string;
  calendar_refs?: string[];
  priority?: number;
};

export type DiscoveryItem = {
  name: string;
  order?: number;
  discovery_schedule?: DiscoveryRule[];
  sefaria_text?: string | null;
};

export type DiscoveryContext = {
  now?: Date;
  calendarRefs?: readonly string[];
};

export const DISCOVERY_TIME_ZONE = "Asia/Jerusalem";
const civilFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DISCOVERY_TIME_ZONE, year: "numeric", month: "numeric", day: "numeric",
});
const hebrewFormatter = new Intl.DateTimeFormat("en-US-u-ca-hebrew", {
  timeZone: DISCOVERY_TIME_ZONE, month: "long", day: "numeric",
});

export function discoveryCivilDate(now: Date): string {
  const parts = civilFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month").padStart(2, "0")}-${part("day").padStart(2, "0")}`;
}

function discoveryDays(now: Date) {
  const civilDate = discoveryCivilDate(now);
  return Array.from({ length: 15 }, (_, offset) => {
    // UTC noon stays on the same Jerusalem civil date through DST changes.
    const date = new Date(`${civilDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    const hebrew = hebrewFormatter.formatToParts(date);
    return {
      iso: date.toISOString().slice(0, 10),
      weekday: date.getUTCDay(),
      gregorianMonth: date.getUTCMonth() + 1,
      hebrewMonth: hebrew.find((part) => part.type === "month")!.value,
      hebrewDay: Number(hebrew.find((part) => part.type === "day")!.value),
    };
  });
}

type DiscoveryDay = ReturnType<typeof discoveryDays>[number];
export type DiscoveryRelevance = { bucket: 0 | 1 | 2; days: number; priority: number };
const fallback: DiscoveryRelevance = { bucket: 2, days: 0, priority: 0 };
const compareRelevance = (a: DiscoveryRelevance, b: DiscoveryRelevance) =>
  a.bucket - b.bucket || a.days - b.days || b.priority - a.priority;

function matches(rule: DiscoveryRule, day: DiscoveryDay) {
  return (!rule.starts_on || day.iso >= rule.starts_on) &&
    (!rule.ends_on || day.iso <= rule.ends_on) &&
    (!rule.weekdays?.length || rule.weekdays.includes(day.weekday)) &&
    (!rule.hebrew_months?.length || rule.hebrew_months.includes(day.hebrewMonth)) &&
    (!rule.hebrew_days?.length || rule.hebrew_days.includes(day.hebrewDay)) &&
    (!rule.gregorian_months?.length || rule.gregorian_months.includes(day.gregorianMonth));
}

const normalizeRef = (ref: string) => ref.trim().replace(/_/g, " ").replace(/\s+/g, " ").replace(/[–—]/g, "-").toLowerCase();

function referenceRange(reference: string) {
  const match = /^(.+?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/.exec(reference);
  if (!match) return null;
  const start = [Number(match[2]), Number(match[3])];
  const end = match[5] ? [Number(match[4] || match[2]), Number(match[5])] : start;
  if (![...start, ...end].every((value) => Number.isSafeInteger(value) && value > 0) || comparePosition(start, end) > 0) return null;
  return { book: match[1], start, end };
}

const comparePosition = (a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1];

export function discoveryReferencesOverlap(first: string, second: string): boolean {
  const a = normalizeRef(first), b = normalizeRef(second);
  if (a === b) return true;
  const firstRange = referenceRange(a), secondRange = referenceRange(b);
  return Boolean(firstRange && secondRange && firstRange.book === secondRange.book &&
    comparePosition(firstRange.start, secondRange.end) <= 0 && comparePosition(secondRange.start, firstRange.end) <= 0);
}

function matchesCalendarReference(reference: string, calendarRefs: Set<string>) {
  for (const current of calendarRefs) {
    if (discoveryReferencesOverlap(reference, current)) return true;
  }
  return false;
}

function relevance(item: DiscoveryItem, days: DiscoveryDay[], calendarRefs: Set<string>): DiscoveryRelevance {
  let best: DiscoveryRelevance = item.sefaria_text && matchesCalendarReference(item.sefaria_text, calendarRefs)
    ? { bucket: 0, days: 0, priority: 10 }
    : fallback;
  for (const rule of item.discovery_schedule || []) {
    if (rule.calendar_refs && !rule.calendar_refs.some((ref) => matchesCalendarReference(ref, calendarRefs))) continue;
    // Calendar references describe today's payload; future references are unknown.
    const offset = (rule.calendar_refs ? days.slice(0, 1) : days).findIndex((day) => matches(rule, day));
    if (offset < 0) continue;
    const rank: DiscoveryRelevance = { bucket: offset === 0 ? 0 : 1, days: offset, priority: rule.priority ?? 10 };
    if (compareRelevance(rank, best) < 0) best = rank;
  }
  return best;
}

function sortRanked<T extends DiscoveryItem>(items: { item: T; rank: DiscoveryRelevance }[]): T[] {
  return items.sort((a, b) => compareRelevance(a.rank, b.rank) ||
    (a.item.order ?? 0) - (b.item.order ?? 0) || a.item.name.localeCompare(b.item.name, "en"))
    .map(({ item }) => item);
}

export function getDiscoveryRank(item: DiscoveryItem, context: DiscoveryContext = {}): DiscoveryRelevance {
  return relevance(item, discoveryDays(context.now || new Date()), new Set((context.calendarRefs || []).map(normalizeRef)));
}

export function sortSubtopicsForDiscovery<T extends DiscoveryItem>(items: readonly T[], context: DiscoveryContext = {}): T[] {
  const days = discoveryDays(context.now || new Date());
  const refs = new Set((context.calendarRefs || []).map(normalizeRef));
  return sortRanked(items.map((item) => ({ item, rank: relevance(item, days, refs) })));
}

export function sortTopicsForDiscovery<T extends DiscoveryItem & { subtopics: DiscoveryItem[] }>(topics: readonly T[], context: DiscoveryContext = {}): T[] {
  const days = discoveryDays(context.now || new Date());
  const refs = new Set((context.calendarRefs || []).map(normalizeRef));
  return sortRanked(topics.map((topic) => {
    let rank = relevance(topic, days, refs);
    const children = topic.subtopics.map((item) => {
      const childRank = relevance(item, days, refs);
      if (compareRelevance(childRank, rank) < 0) rank = childRank;
      return { item, rank: childRank };
    });
    return { item: { ...topic, subtopics: sortRanked(children) }, rank };
  }));
}
