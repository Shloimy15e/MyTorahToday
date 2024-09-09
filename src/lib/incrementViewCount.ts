import Video from "@/types/Video";

export async function incrementViewCount(id: Video["id"]): Promise<Response> {
  try {
    const response = await fetch(`/api/videos/${id}/view`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: JSON.stringify(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function incrementViewCountServer(
  id: Video["id"],
  authToken: string | null
) {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/videos/${id}/view`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Token ${authToken}` }),
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to increment view count");
  }
}
