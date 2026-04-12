import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  params.set("limit", sanitizeInput(searchParams.get("limit") || "10"));
  params.set("offset", sanitizeInput(searchParams.get("offset") || "0"));

  for (const topic of searchParams.getAll("topics")) {
    params.append("topics", sanitizeInput(topic));
  }
  for (const subtopic of searchParams.getAll("subtopics")) {
    params.append("subtopics", sanitizeInput(subtopic));
  }

  const topicName = searchParams.get("topic__name__iexact");
  if (topicName) params.set("topic__name__iexact", sanitizeInput(topicName));

  const subtopicName = searchParams.get("subtopic__name__iexact");
  if (subtopicName) params.set("subtopic__name__iexact", sanitizeInput(subtopicName));

  const url = new URL(`${process.env.BACKEND_URL}/api/videos/`);
  url.search = params.toString();

  let authToken = cookies().get("auth_token")?.value || null;
  if (!authToken) {
    authToken = request.headers.get("Authorization") || null;
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `${authToken}` }),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request): Promise<Response> {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/videos/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.json(),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
