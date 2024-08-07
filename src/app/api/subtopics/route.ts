import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 * @description This function handles the GET request to retrieve all videos.
 * It can take pagination, filtering, and sorting parameters.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "";
  const offset = searchParams.get("offset") || "";
  const topic = searchParams.get("topic") || "";
  const topic__name = searchParams.get("topic__name__iexact") || "";

  const response = await fetch(
    `https://mttbackend-production.up.railway.app/api/subtopics/?limit=${limit}&offset=${offset}&topic=${topic}&topic__name__iexact=${topic__name}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      agent: agent
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
