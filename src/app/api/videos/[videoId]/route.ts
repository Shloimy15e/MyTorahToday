import { NextResponse, NextRequest } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { cookies } from "next/headers";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

type Props = {
  params: {
    videoId: string;
  };
};

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 * @description This function handles the GET request to retrieve one video by vdeo_id.
 */
export async function GET(request: NextRequest, { params }: Props): Promise<Response> {
  // Get /video_id from the request
  console.log("videoById: Request received for video_id:", params.videoId);
  console.log("videoById: request ", request);
  console.log("videoById: cookies", request.cookies);
  const { videoId } = params;
  const authToken = request.cookies.get("auth_token")?.value
  console.log("authToken", authToken);

  if (!videoId) {
    // Return a 400 Bad Request if no video_id is provided
    return NextResponse.json(
      { error: "No video_id provided" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://mttbackend-production.up.railway.app/api/videos/${videoId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Token ${authToken}` }),
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
