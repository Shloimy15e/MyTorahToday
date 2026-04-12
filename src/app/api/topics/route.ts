import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limit = sanitizeInput(searchParams.get("limit") || "10");
  const offset = sanitizeInput(searchParams.get("offset") || "0");
  const name = sanitizeInput(searchParams.get("name__iexact") || "");

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/topics/?name__iexact=${name}&limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
