import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";
import { fetchDiscoveryCalendarRefs } from "@/data/discoveryCalendar";
import { sortTopicsForDiscovery } from "@/utils/discoveryOrder";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  params.set("limit", sanitizeInput(searchParams.get("limit") || "10"));
  params.set("offset", sanitizeInput(searchParams.get("offset") || "0"));

  const name = searchParams.get("name__iexact");
  if (name) params.set("name__iexact", sanitizeInput(name));

  const url = new URL(`${process.env.BACKEND_URL}/api/topics/`);
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  if (Array.isArray(data.results)) {
    const now = new Date();
    const calendarRefs = await fetchDiscoveryCalendarRefs(now);
    data.results = sortTopicsForDiscovery(data.results, { now, calendarRefs });
  }
  return NextResponse.json(data, { status: response.status });
}
