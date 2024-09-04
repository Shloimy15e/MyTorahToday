import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { cookies } from "next/headers";
import {sanitizeInput} from "@/utils/sanitizeInput";

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
  const topic = sanitizeInput(searchParams.get("topic") || "");
  const subtopic = sanitizeInput(searchParams.get("subtopic") || "");
  const topic__name = sanitizeInput(searchParams.get("topic__name__iexact") || "");
  const subtopic__name = sanitizeInput(searchParams.get("subtopic__name__iexact") || "");
  const url = `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&offset=${offset}&topic=${topic}&subtopic=${subtopic}&topic__name__iexact=${topic__name}&subtopic__name__iexact=${subtopic__name}`
  let authToken = cookies().get('auth_token')?.value || null;

  if(!authToken) {
    authToken = request.headers.get('Authorization') || null;
    console.log("videos: auth_token not found in cookies");
    if (!authToken) {
      console.log("videos: auth_token also not found in request headers");
    }
  }

  const response = await fetch(url,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { "Authorization": `${authToken}` }),
      },
      agent: agent,
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
    "${process.env.BACKEND_URL}/api/videos/",
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
