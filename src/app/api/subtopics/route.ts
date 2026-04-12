import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  params.set("limit", sanitizeInput(searchParams.get("limit") || "10"));
  params.set("offset", sanitizeInput(searchParams.get("offset") || "0"));

  const id = searchParams.get("id");
  if (id) params.set("id", sanitizeInput(id));

  const name = searchParams.get("name");
  if (name) params.set("name__iexact", sanitizeInput(name));

  const topic = searchParams.get("topic");
  if (topic) params.set("topic", sanitizeInput(topic));

  const topicName = searchParams.get("topic__name__iexact");
  if (topicName) params.set("topic__name__iexact", sanitizeInput(topicName));

  const ordering = searchParams.get("ordering");
  if (ordering) params.set("ordering", sanitizeInput(ordering));

  const url = new URL(`${process.env.BACKEND_URL}/api/subtopics/`);
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
