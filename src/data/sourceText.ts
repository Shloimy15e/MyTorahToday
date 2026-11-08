export type SourceTextSection = { ref: string; text: string[]; references?: string[] };

export type SourceText = {
  text: string[];
  title: string;
  sourceUrl: string;
  direction?: "rtl" | "ltr";
  language?: string;
  sections?: SourceTextSection[];
};

function flattenText(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  return Array.isArray(value) ? value.flatMap(flattenText) : [];
}

export async function fetchSourceText(subtopic: { name: string; sefaria_text: string | null }): Promise<SourceText | null> {
  try {
    const reference = subtopic.sefaria_text || subtopic.name;
    const url = new URL(`/api/v3/texts/${encodeURIComponent(reference)}`, "https://www.sefaria.org");
    url.searchParams.set("return_format", "strip_only_footnotes");
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const version = data?.versions?.[0];
    const text = flattenText(version?.text);
    if (!text.length) return null;
    const ref = typeof data.ref === "string" && data.ref.trim() ? data.ref : reference;
    const direction = version.direction === "rtl" || version.direction === "ltr" ? version.direction : undefined;
    const language = typeof version.language === "string" ? version.language : undefined;
    const title = direction !== "ltr" && typeof data.heRef === "string" && data.heRef.trim() ? data.heRef : ref;
    const spanningRefs: unknown = data.spanningRefs;
    // A spanning reference identifies each outer text group; other shapes stay unlabelled.
    const sections = Array.isArray(spanningRefs) && spanningRefs.length > 1 &&
      spanningRefs.every((section) => typeof section === "string" && section.trim()) &&
      Array.isArray(version.text) && version.text.length === spanningRefs.length && version.text.every(Array.isArray)
      ? spanningRefs.map((section, index) => {
        const group: SourceTextSection = { ref: section as string, text: flattenText(version.text[index]) };
        const address = /^(.*) (\d+)(?::(\d+)(?:-(\d+))?)?$/.exec(group.ref);
        const raw = version.text[index];
        // Only integer, two-level sources have an unambiguous segment address here.
        if (data.textDepth === 2 && data.addressTypes?.length === 2 && data.addressTypes.every((type: string) => ["Integer", "Perek", "Pasuk"].includes(type)) && address && raw.every((segment: unknown) => typeof segment === "string") && (!address[4] || Number(address[4]) - Number(address[3]) + 1 === raw.length)) {
          group.references = raw.flatMap((segment: string, segmentIndex: number) => segment.trim() ? [`${address[1]} ${address[2]}:${Number(address[3] || 1) + segmentIndex}`] : []);
        }
        return group;
      })
      : undefined;
    return { text, title, sourceUrl: `https://www.sefaria.org/${encodeURIComponent(ref)}`, direction, language, sections };
  } catch {
    return null;
  }
}
