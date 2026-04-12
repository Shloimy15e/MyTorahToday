import { NextResponse } from "next/server";
import { sanitizeInput } from "@/utils/sanitizeInput";
import { getAuthToken } from "@/utils/getAuthToken";

type Props = { params: { videoId: number } };

export async function POST(request: Request, { params }: Props): Promise<Response> {
  const { videoId } = params;
  if (!videoId) {
    return NextResponse.json({ error: "No video_id provided" }, { status: 400 });
  }
  const authToken = getAuthToken(request);
  if (!authToken) {
    return NextResponse.json({ error: "No authToken provided" }, { status: 400 });
  }

  const url = `${process.env.BACKEND_URL}/api/videos/${sanitizeInput(videoId)}/save/`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${authToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
