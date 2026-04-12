import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

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
  return NextResponse.json(data, { status: response.status });
}
