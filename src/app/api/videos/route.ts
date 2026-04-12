import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sanitizeInput } from "@/utils/sanitizeInput";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limit = sanitizeInput(searchParams.get("limit") || "10");
  const offset = sanitizeInput(searchParams.get("offset") || "0");
  const topics = sanitizeInput(searchParams.getAll("topics") || "");
  const subtopics = sanitizeInput(searchParams.getAll("subtopics") || "");
  const topic__name = sanitizeInput(searchParams.get("topic__name__iexact") || "");
  const subtopic__name = sanitizeInput(searchParams.get("subtopic__name__iexact") || "");
  const topicsArray = topics?.map((topic: string | number) => `topics=${topic}`).join("&");
  const subtopicsArray = subtopics?.map((subtopic: string | number) => `subtopics=${subtopic}`).join("&");
  const url = `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&offset=${offset}&${topicsArray}&${subtopicsArray}&topic__name__iexact=${topic__name}&subtopic__name__iexact=${subtopic__name}`;
  let authToken = cookies().get("auth_token")?.value || null;

  if (!authToken) {
    authToken = request.headers.get("Authorization") || null;
  }

  const response = await fetch(url, {
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
