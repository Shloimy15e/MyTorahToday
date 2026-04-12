import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

type Props = { params: Promise<{ topicId: string }> };

export async function GET(request: Request, { params }: Props): Promise<Response> {
  const { topicId } = await params;
  if (!topicId) {
    return NextResponse.json({ error: "No topicId provided" }, { status: 400 });
  }

  const url = new URL(`/api/topics/${sanitizeInput(topicId)}/`, process.env.BACKEND_URL);
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
