import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { sanitizeInput } from "@/utils/sanitizeInput";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

type Props = {
  params: {
    topicId: string;
  };
};

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 * @description This function handles the GET request to retrieve all videos.
 * It can take pagination, filtering, and sorting parameters.
 */
export async function GET(request: Request, { params }: Props): Promise<Response> {
  const { topicId } = params;
  if (!topicId) {
    return NextResponse.json({ error: "No topicId provided" }, { status: 400 });
  }
  const sanitizedTopicId = sanitizeInput(topicId);
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/topics/${sanitizedTopicId}/`,
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
