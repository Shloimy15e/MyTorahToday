import Subtopic from "@/types/Subtopic";
import Topic from "@/types/Topic";
import Video from "@/types/Video";

function backendUrl(path: string, params?: Record<string, string | string[]>): string {
  const url = new URL(path, process.env.BACKEND_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, String(v));
      } else if (value) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

function clientUrl(path: string, params?: Record<string, string | string[]>): string {
  const url = new URL(path, "http://localhost");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, String(v));
      } else if (value) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.pathname + url.search;
}

function authHeaders(authToken: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Token ${authToken}` }),
  };
}

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const contentType = response.headers.get("Content-Type");
    let detail = "";
    if (contentType?.includes("application/json")) {
      detail = " " + JSON.stringify(await response.json());
    }
    throw new Error(`HTTP error ${response.status}${detail}`);
  }
  return response.json();
}

// --- Server-side fetchers (use BACKEND_URL directly) ---

export const fetchRelatedVideosServer = async (
  videoId: number,
  topics: (string | number)[],
  subtopics: (string | number)[],
  authToken: string | null = null,
  limit: number = 22
): Promise<Video[]> => {
  const url = backendUrl("/api/videos/", {
    limit: String(limit),
    topics: topics.map(String),
    subtopics: subtopics.map(String),
  });

  const data = await fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });

  let videos: Video[] = data.results?.filter((v: Video) => v.id !== videoId) ?? [];

  if (videos.length < 12) {
    const moreUrl = backendUrl("/api/videos/", {
      limit: String(15 - videos.length),
      topics: topics.map(String),
      subtopics: subtopics.map(String),
    });
    const moreData = await fetchJson(moreUrl, {
      headers: authHeaders(authToken),
      cache: "no-store",
    });
    if (moreData.results) {
      videos = [...videos, ...moreData.results];
    }
  }

  return videos;
};

export const getVideosByTopicNameServer = async (
  topic: string,
  authToken: string | null,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const url = backendUrl("/api/videos/", {
    limit: String(limit),
    "topic__name__iexact": topic,
  });
  const data = await fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });
  return { topicName: topic, videos: data.results };
};

export const getVideosByTopicsServer = async (
  topics: (string | number)[],
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  const url = backendUrl("/api/videos/", {
    limit: String(limit),
    topics: topics.map(String),
  });
  const data = await fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });
  return data.results;
};

export const getVideosBySubtopicNameServer = async (
  subtopic: string,
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  const url = backendUrl("/api/videos/", {
    limit: String(limit),
    "subtopic__name__iexact": subtopic,
  });
  const data = await fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });
  return data.results;
};

export const getVideosBySubtopicsServer = async (
  subtopicIds: (string | number)[],
  authToken: string | null,
  limit: number = 10
): Promise<Video[]> => {
  if (subtopicIds.length === 0) return [];
  const url = backendUrl("/api/videos/", {
    limit: String(limit),
    subtopics: subtopicIds.map(String),
  });
  const data = await fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });
  return data.results;
};

export const fetchTopicsServer = async (): Promise<Topic[]> => {
  const url = backendUrl("/api/topics/");
  const data = await fetchJson(url);
  return data.results;
};

export const fetchSubtopicsServer = async (topicId: string): Promise<Subtopic[]> => {
  const url = backendUrl("/api/subtopics/", { topic: topicId });
  const data = await fetchJson(url);
  return data.results;
};

export const fetchTopicServer = async (topicId: string | number): Promise<Topic> => {
  const url = backendUrl(`/api/topics/${topicId}/`);
  return fetchJson(url);
};

export const fetchTopicServerByName = async (topicName: string): Promise<Topic> => {
  const url = backendUrl("/api/topics/", { "name__iexact": topicName });
  const data = await fetchJson(url);
  return data.results[0];
};

export const fetchSubtopicServer = async (subtopicId: string | number): Promise<Subtopic> => {
  const url = backendUrl(`/api/subtopics/${subtopicId}/`);
  return fetchJson(url);
};

export const fetchSubtopicServerByName = async (name: string): Promise<Subtopic | null> => {
  const url = backendUrl("/api/subtopics/", { "name__iexact": name });
  const data = await fetchJson(url);
  return data.results?.[0] ?? null;
};

// --- Client-side fetchers (go through Next.js proxy routes) ---

export async function toggleLike(id: Video["id"]): Promise<Response> {
  const response = await fetch(clientUrl(`/api/videos/${id}/like`), {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} ${JSON.stringify(data)}`);
  }
  return new Response(JSON.stringify(data), { status: response.status });
}

export async function toggleSave(id: Video["id"]): Promise<Response> {
  const response = await fetch(clientUrl(`/api/videos/${id}/save`), {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} ${JSON.stringify(data)}`);
  }
  return new Response(JSON.stringify(data), { status: response.status });
}

export const getVideoByVideoId = async (
  videoId: string,
  authToken: string | null
): Promise<Video> => {
  const url = clientUrl(`/api/videos/${videoId}/`);
  return fetchJson(url, {
    headers: authHeaders(authToken),
    cache: "no-store",
  });
};

export const getVideosByTopicName = async (
  topic: string,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const url = clientUrl("/api/videos/", {
    limit: String(limit),
    "topic__name__iexact": topic,
  });
  const data = await fetchJson(url);
  return { topicName: topic, videos: data.results };
};

export const getVideosBySubtopicName = async (
  subtopic: string,
  limit: number = 10
): Promise<Video[]> => {
  const url = clientUrl("/api/videos/", {
    limit: String(limit),
    "subtopic__name__iexact": subtopic,
  });
  const data = await fetchJson(url);
  return data.results;
};

export const fetchTopics = async (): Promise<Topic[]> => {
  const url = clientUrl("/api/topics/");
  const data = await fetchJson(url);
  return data.results;
};

export const fetchSubtopics = async (topic: string): Promise<Subtopic[]> => {
  const url = clientUrl("/api/subtopics/", { "topic__name__iexact": topic });
  const data = await fetchJson(url);
  return data.results;
};
