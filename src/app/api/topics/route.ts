import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { sanitizeInput } from "@/utils/sanitizeInput";

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
  const limit = sanitizeInput(searchParams.get("limit") || "10");
  const offset = sanitizeInput(searchParams.get("offset") || "0");
  const name = sanitizeInput(searchParams.get("name") || "");

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/topics/?name__iexact=${name}&limit=${limit}&offset=${offset}`,
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
