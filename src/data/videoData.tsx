import Subtopic from "@/types/Subtopic";
import Video from "@/types/Video";

export const fetchRelatedVideos = async (
  topic: string,
  subtopic: string
): Promise<Video[]> => {
  try {
    const response = await fetch(
      `https://www.mytorahtoday.com/api/videos/?limit=22&topic__name__iexact=${topic}&subtopic__name__iexact=${subtopic}`
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("Error fetching related videos:", data.error);
    }

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
          `https://www.mytorahtoday.com/api/videos/?limit=${limit}&topic__name__iexact=${topic}`
        );
        console.log(
          `Related videos inner received response with status: ${response.status}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }

        // Extract videosfrom results and add to receivedVideos
        if (!receivedVideos) {
          if (data.results) {
            receivedVideos = data.results;
          } else {
            throw new Error("No results found in the response");
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
  console.log("toggleLike called with id:", id);
  try {
    const response = await fetch(
      `http://localhost:3000//api/videos/${id}/like`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    if (data.detail.includes("unliked")) {
      console.log("Successfully unliked video");
    } else if (data.detail.includes("liked")) {
      // Add one like to props.video.likes
      console.log("Successfully liked video");
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Error liking video:", error);

    return new Response(JSON.stringify({ error: JSON.stringify(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const getVideoByVideoId = async (videoId: string, authToken: string | null): Promise<Video> => {
  const response = await fetch(`http://localhost:3000/api/videos/${videoId}/`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { "Authorization": `${authToken}` }),
    },
  });
  const data = await response.json();
  console.log("data", JSON.stringify(data));
  return data;
};

export const getVideosByTopicName = async (
  topic: string,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const response = await fetch(
    `https://www.mytorahtoday.com/api/videos/?limit=${limit}&topic__name__iexact=${topic}`
  );
  const data = await response.json();

  return { topicName: topic, videos: data.results };
};

export const getVideosBySubtopicName = async (
  subtopic: string,
  limit: number = 10
): Promise<Video[]> => {
  const url = `https://www.mytorahtoday.com/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const fetchTopics = async (): Promise<any> => {
  const response = await fetch("https://www.mytorahtoday.com/api/topics/");
  const data = await response.json();
  return data.results;
};

export const fetchSubtopics = async (topic: string): Promise<Subtopic[]> => {
  const url = `https://www.mytorahtoday.com/api/subtopics/?topic__name__iexact=${topic}`;
  console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};
