import Video from "@/types/Video";

export async function incrementViewCount(id: Video["id"]): Promise<Response> {
  try {
    const response = await fetch(`/api/videos/${id}/view`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${JSON.stringify(data)}`);
    }
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function incrementViewCountServer(
  id: Video["id"],
  authToken: string | null
) {
  const url = new URL(`/api/videos/${id}/view/`, process.env.BACKEND_URL);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Token ${authToken}` }),
    },
  });
  if (!response.ok) {
    console.error("Failed to increment view count");
  }
}
