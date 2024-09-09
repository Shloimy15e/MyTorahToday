import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { cookies } from "next/headers";
import { sanitizeInput } from "@/utils/sanitizeInput";

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
  if (!videoId) {
    // Return a 400 Bad Request if no video_id is provided
    return NextResponse.json(
      { error: "No video_id provided" },
      { status: 400 }
    );
  }
  const sanitizedVideoId = sanitizeInput(videoId);
  let authToken = cookies().get("auth_token")?.value || null;
  console.log("authToken", authToken);
  if (!authToken) {
    console.log("viewVideo: auth_token not found in cookies");
    authToken = request.headers.get("Authorization") || null;
    if (!authToken) {
      console.log("viewVideo: auth_token also not found in request headers");
      return NextResponse.json(
        { error: "No authToken provided" },
        { status: 400 }
      );
    }
  }
  const url = `${process.env.BACKEND_URL}/api/videos/${sanitizedVideoId}/view/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Token ${authToken}` }),
    },
    agent: agent,
  });
  const data = await response.json();
  console.log("data", JSON.stringify(data));
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
