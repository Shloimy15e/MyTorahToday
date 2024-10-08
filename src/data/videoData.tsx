import Subtopic from "@/types/Subtopic";
import Video from "@/types/Video";

export const fetchRelatedVideosServer = async (
  topic: string,
  subtopic: string,
  authToken: string | null = null,
  limit: number = 22
): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&topic__name__iexact=${topic}&subtopic__name__iexact=${subtopic}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage += " " + JSON.stringify(errorData);
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    let receivedVideos = null;
    if (data.results) {
      receivedVideos = data.results;
      console.log(
        "Successfully fetched related videos. Total videos:",
        data.results.length
      );
    }
    // Extract videosfrom results
    if (!receivedVideos || receivedVideos.length < 12) {
      console.log(
        "Not enough videos to fetch related videos. Fetching more..."
      );

      const limit = 15 - receivedVideos.length;
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&topic__name__iexact=${topic}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authToken && { Authorization: `Token ${authToken}` }),
            },
            cache: "no-store",
          }
        );
        if (!response.ok) {
          let errorMessage = `HTTP error ${response.status}`;
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage += " " + JSON.stringify(errorData);
          }
          throw new Error(errorMessage);
        }
        console.log(
          `Related videos inner received response with status: ${response.status}`
        );
        const data = await response.json();
        // Extract videosfrom results and add to receivedVideos
        if (!receivedVideos) {
          if (data.results) {
            receivedVideos = data.results;
          } else {
            throw new Error("404 - No results found in the response");
          }
        } else {
          receivedVideos = [...receivedVideos, ...data.results];
        }
        return receivedVideos;
      } catch (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
    }
    return receivedVideos;
  } catch (error) {
    console.error("Error fetching related videos: ", error);
    throw error;
  }
};

export async function toggleLike(id: Video["id"]): Promise<Response> {
  try {
    const response = await fetch(`/api/videos/${id}/like`, {
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

export async function toggleSave(id: Video["id"]): Promise<Response> {
  try {
    const response = await fetch(`/api/videos/${id}/save`, {
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

export const getVideoByVideoId = async (
  videoId: string,
  authToken: string | null
): Promise<Video> => {
  const response = await fetch(`/api/videos/${videoId}/`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `${authToken}` }),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage += " " + JSON.stringify(errorData);
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data;
};

export const getVideosByTopicName = async (
  topic: string,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const response = await fetch(
    `/api/videos/?limit=${limit}&topic__name__iexact=${topic}`
  );
  const data = await response.json();

  return { topicName: topic, videos: data.results };
};

export const getVideosByTopicNameServer = async (
  topic: string,
  authToken: string | null,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&topic__name__iexact=${topic}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Token ${authToken}` }),
      },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage += " " + JSON.stringify(errorData);
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return { topicName: topic, videos: data.results };
};

export const getVideosBySubtopicName = async (
  subtopic: string,
  limit: number = 10
): Promise<Video[]> => {
  const url = `/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const getVideosBySubtopicNameServer = async (
  subtopic: string,
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  const url = `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`;
  console.log(url);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Token ${authToken}` }),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage += " " + JSON.stringify(errorData);
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.results;
};

export const fetchTopics = async (): Promise<any> => {
  const response = await fetch(`/api/api/topics/`);
  const data = await response.json();
  return data.results;
};

export const fetchTopicsServer = async (): Promise<any> => {
  const response = await fetch(`${process.env.BACKEND_URL}/api/topics/`);
  const data = await response.json();
  return data.results;
};

export const fetchSubtopics = async (topic: string): Promise<Subtopic[]> => {
  const url = `/api/subtopics/?topic__name__iexact=${topic}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const fetchSubtopicsServer = async (
  topic: string
): Promise<Subtopic[]> => {
  const url = `${process.env.BACKEND_URL}/api/subtopics/?topic__name__iexact=${topic}`;
  console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};
