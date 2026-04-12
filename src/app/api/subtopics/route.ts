import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limit = sanitizeInput(searchParams.get("limit") || "10");
  const offset = sanitizeInput(searchParams.get("offset") || "0");
  const id = sanitizeInput(searchParams.get("id") || "");
  const name = sanitizeInput(searchParams.get("name") || "");
  const topic = sanitizeInput(searchParams.get("topic") || "");
  const topic__name = sanitizeInput(searchParams.get("topic__name__iexact") || "");
  const ordering = sanitizeInput(searchParams.get("ordering") || "");

  const url = `${process.env.BACKEND_URL}/api/subtopics/?id=${id}&name__iexact=${name}&limit=${limit}&offset=${offset}&topic__name__iexact=${topic__name}&topic=${topic}&ordering=${ordering}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
