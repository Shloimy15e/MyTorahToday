import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";

type Props = { params: { topicId: string } };

export async function GET(request: Request, { params }: Props): Promise<Response> {
  const { topicId } = params;
  if (!topicId) {
    return NextResponse.json({ error: "No topicId provided" }, { status: 400 });
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/topics/${sanitizeInput(topicId)}/`,
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
