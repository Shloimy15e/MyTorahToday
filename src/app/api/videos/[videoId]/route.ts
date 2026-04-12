import { NextResponse, NextRequest } from "next/server";
import { getSession } from "next-auth/react";
import { sanitizeInput } from "@/utils/sanitizeInput";

type Props = {
  params: {
    videoId: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Props
): Promise<Response> {
  try {
    const session = await getSession();
    const { videoId } = params;
    if (!videoId) {
      return NextResponse.json(
        { error: "No video_id provided" },
        { status: 400 }
      );
    }
    const sanitizedVideoId = sanitizeInput(videoId);
    const authToken = session?.accessToken || null;

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/${sanitizedVideoId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        cache: "no-store",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error " + error },
      { status: 500 }
    );
  }
}
