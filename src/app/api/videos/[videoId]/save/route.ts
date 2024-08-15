import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

type Props = {
  params: {
    videoId: number;
  };
};

export async function POST(
  request: Request,
  { params }: Props
): Promise<Response> {
  // Get video.id from the request
  const { videoId } = params;
  const authToken = request.headers.get("Authorization");
  if (!authToken) {
    return NextResponse.json(
      { error: "No authToken provided" },
      { status: 400 }
    );
  }

  if (!videoId) {
    // Return a 400 Bad Request if no video.id is provided
    return NextResponse.json(
      { error: "No video.id provided" },
      { status: 400 }
    );
  }
  const url = `https://mttbackend-production.up.railway.app/api/videos/${videoId}/save/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `${authToken}` }),
    },
    agent: agent,
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
