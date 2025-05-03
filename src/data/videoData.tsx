import Subtopic from "@/types/Subtopic";
import Topic from "@/types/Topic";
import Video from "@/types/Video";

export const fetchRelatedVideosServer = async (
  videoId: number,
  topics: (string | number)[],
  subtopics: (string | number)[],
  authToken: string | null = null,
  limit: number = 22
): Promise<Video[]> => {
  try {
    const topicsParams = topics?.map((t) => `topics=${t}`).join("&");
    const subtopicsParams = subtopics?.map((s) => `subtopics=${s}`).join("&");
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&${topicsParams}&${subtopicsParams}`,
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
      receivedVideos = data.results.filter((video: Video) => video.id !== videoId);
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
          `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&${topicsParams}&${subtopicsParams}`,
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

export const getVideosByTopicsServer = async (
  topics: (string | number)[],
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  const topicsParams = topics?.map((t) => `topics=${t}`).join("&");
  const url = `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&${topicsParams}`;  
  console.log("url: ", url);
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

export const getVideosBySubtopicsServer = async (
  subtopicIds: (string | number)[],
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  if (subtopicIds.length === 0) {
    return [];
  }
  const params = subtopicIds.map((id) => `subtopics=${id}`).join("&");
  const url = `${process.env.BACKEND_URL}/api/videos/?limit=${limit}&${params}`;
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
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/topics/`);
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
  } catch (error) {
    console.error("Error fetching topics: ", error);
    throw error;
  }
};

export const fetchSubtopics = async (topic: string): Promise<Subtopic[]> => {
  const url = `/api/subtopics/?topic__name__iexact=${topic}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const fetchSubtopicsServer = async (
  topicId: string
): Promise<Subtopic[]> => {
  const url = `${process.env.BACKEND_URL}/api/subtopics/?topic=${topicId}`;
  console.log("url 66: ", url);
  console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const fetchTopicServer = async (topicId: string | number): Promise<Topic> => {
  const url = `${process.env.BACKEND_URL}/api/topics/${topicId}/`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const fetchTopicServerByName = async (topicName: string): Promise<Topic> => {
  const url = `${process.env.BACKEND_URL}/api/topics/?name__iexact=${topicName}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results[0];
};

export const fetchSubtopicServer = async (subtopicId: string | number): Promise<Subtopic> => {
  const url = `${process.env.BACKEND_URL}/api/subtopics/${subtopicId}/`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};