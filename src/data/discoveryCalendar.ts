import { discoveryCivilDate, DISCOVERY_TIME_ZONE } from "@/utils/discoveryOrder";

export async function fetchDiscoveryCalendarRefs(now = new Date()): Promise<string[]> {
  try {
    const [year, month, day] = discoveryCivilDate(now).split("-");
    const url = new URL("https://www.sefaria.org/api/calendars");
    url.search = new URLSearchParams({ year, month, day, timezone: DISCOVERY_TIME_ZONE }).toString();
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data.calendar_items)) return [];
    return data.calendar_items.flatMap((item: { ref?: unknown }) =>
      typeof item?.ref === "string" && item.ref.trim() ? [item.ref] : []);
  } catch {
    return [];
  }
}
