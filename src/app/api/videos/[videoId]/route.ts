import { NextResponse, NextRequest } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { getSession } from "next-auth/react";
import { sanitizeInput } from "@/utils/sanitizeInput";

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
export async function GET(
  request: NextRequest,
  { params }: Props
): Promise<Response> {
  try {
    const session = await getSession();
    // Get /video_id from the request
    console.log("videoById: Request received for video_id:", params.videoId);
    const { videoId } = params;
    if (!videoId) {
      // Return a 400 Bad Request if no video_id is provided
      return NextResponse.json(
        { error: "No video_id provided" },
        { status: 400 }
      );
    }
    const sanitizedVideoId = sanitizeInput(videoId);
    const authToken = session?.accessToken || null;
    console.log("videoById: authToken", authToken);
    if (!authToken) {
      console.log("videoById: authToken was not found in cookies");
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/${sanitizedVideoId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
          cache: "no-store",
        },
        agent: agent,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Internal Server Error " + error },
      { status: 500 }
    );
  }
}
