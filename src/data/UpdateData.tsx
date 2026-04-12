import Video from "@/types/Video";

export async function fetchUpdatedData() {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/`
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
      topics_data: { id: number; name: string }[];
      subtopics_data: { id: number; name: string }[];
      likes: number;
      video_id: string;
    }) => ({
      video_id: video.video_id,
      title: video.title,
      topics_data: video.topics_data,
      subtopics_data: video.subtopics_data,
      likes: video.likes,
    })
  );
}

export async function updateVideoData(
  currentVideoData: Video[],
  newData: Video[]
): Promise<Video[]> {
  return currentVideoData.map((video: Video) => {
    const updatedVideo = newData.find(
      (v: Video) => v.video_id === video.video_id
    );
    return updatedVideo
      ? {
          ...video,
          title: updatedVideo.title,
          topics_data: updatedVideo.topics_data,
          subtopics_data: updatedVideo.subtopics_data,
          likes: updatedVideo.likes,
        }
      : video;
  });
}

export async function fetchAndUpdateData(currentVideoData: Video[]): Promise<Video[]> {
  const updateData = await fetchUpdatedData();
  return updateVideoData(currentVideoData, updateData);
}
