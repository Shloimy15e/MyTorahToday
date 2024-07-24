// get updated data from backend

// Check for updated title, topic, subtopic, and likes data in the backend
export async function fetchUpdatedData() {
  try {
    const response = await fetch(
      "https://mttbackend-production.up.railway.app/api/videos/"
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error("Error fetching updated data: ", error);
    return [];
  }
}

export async function getVideoData() {
  const allData = await fetchUpdatedData();
  return allData.map(
    (video: {
      title: string;
      topic: string;
      subtopic: string;
      likes: number;
      video_id: string;
    }) => ({
      video_id: video.video_id,
      title: video.title,
      topic: video.topic,
      subtopic: video.subtopic,
      likes: video.likes,
    })
  );
}

export async function updateVideoData(
  currentVideoData: {
    video_id: string;
    title: string;
    topic: string;
    subtopic: string;
    likes: number;
  }[],
  updateVideoData: {
    video_id: string;
    title: string;
    topic: string;
    subtopic: string;
    likes: number;
  }[]
) {
  const updatedVideoData = currentVideoData.map(
    (video: {
      video_id: string;
      title: string;
      topic: string;
      subtopic: string;
      likes: number;
    }) => {
      const updatedVideo = updateVideoData.find(
        (updatedVideo: {
          video_id: string;
          title: string;
          topic: string;
          subtopic: string;
          likes: number;
        }) => updatedVideo.video_id === video.video_id
      );
      if (updatedVideo) {
        return {
          ...video,
          title: updatedVideo.title,
          topic: updatedVideo.topic,
          subtopic: updatedVideo.subtopic,
          likes: updatedVideo.likes,
        };
      } else {
        return video;
      }
    }
  );
}

export const updateData = await getVideoData();
