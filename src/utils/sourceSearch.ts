export function normalizeSourceSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function findSourceMatches(passages: { key: string; text: string; reference: string }[], query: string): string[] {
  const needle = normalizeSourceSearch(query);
  return needle ? passages.filter(passage => normalizeSourceSearch(`${passage.reference} ${passage.text}`).includes(needle)).map(passage => passage.key) : [];
}

export function nextSourceMatch(current: number, count: number, step: number): number {
  return count ? (current + step + count) % count : 0;
}
