import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  const limit = searchParams.get("limit") || "10";
  const offset = searchParams.get("offset") || "0";
  const topic = searchParams.get("topic") || null;
  const subtopic = searchParams.get("subtopic") || null;

  const response = await fetch(
    `https://mttbackend-production.up.railway.app/api/videos/?limit=${limit}&offset=${offset}${
      topic ? "&topic=" + topic : ""
    }${subtopic ? "&subtopic=" + subtopic : ""}`,
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

/**
 *
 * @param {Request } request a json object as {"videos":[{"title":"","video_id":"","topic":"","tags":[],"subtopic":"","description":"","duration":"","publishedAt":"","likes":0,"views":0}]}
 * @returns {Promise<Response>}
 * @description This function handles the POST request to upload one or more videos to the backend.
 * It takes a json object as input and returns a json object with the created video.
 */
export async function POST(request: Request): Promise<Response> {
  const response = await fetch(
    "https://mttbackend-production.up.railway.app/api/videos/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await request.json(),
      agent: agent,
    }
  );
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status }); /*  */
}