const path = require("path");
const fs = require("fs");
const Video = require("../types/Video");

/**
 * This module uploads all videos from videoData.tsx to the mttBackend backend app
 * If videos are present then it just updates them with new likes and views values
 */

/**
 *
 * @param {Array[object]} videoData
 * Turns array into a json object with array of objects
 * @returns
 */
async function uploadVideoData(videoData) {
  console.log("Uploading video data...");

  const backendUrl = "https://mttbackend-production.up.railway.app/api/videos/";

  /** The API expects an object with "videos": array of objects of type Video with the following properties:
   *  title
   *  video_id
   *  topic
   *  subtopic
   *  tags string[]
   *  description
   *  duration
   *  publishedAt
   *  likes
   *  views
   */
  // Create Json object with data from videoData
  const videos = videoData.map((video) => {
    return {
      title: video.title,
      video_id: video.video_id,
      topic: video.topic,
      subtopic: video.subtopic,
      likes: video.likes,
    };
  });
  const payload = { videos };
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        `Error uploading video data: ${response.statusText} ${JSON.stringify(
          data
        )}`
      );
    }
    console.log("Video data uploaded successfully");
    return await response.json();
  } catch (error) {
    console.error("Error uploading video data: ", error);
    throw new Error("Error uploading video data " + error);
  }
}

async function uploadVideosBackend() {
  console.log("Uploading videos to backend...");
  try {
    const filePath = path.join(process.cwd(), "src", "data", "videoData.tsx");
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const videoData = fs.readFileSync(filePath, "utf-8");
    const match = videoData.match(
      /export const videoData: Video\[\] = (\[[\s\S]*?\]);/
    );
    if (!match) {
      console.error("No video data found in file");
      return;
    }

    const extractedData = match[1];

    const parsedVideos = eval(extractedData);

    await uploadVideoData(parsedVideos);
  } catch (error) {
    console.error("Error uploading video data:", error);
    throw new Error("Error uploading video data " + error);
  }
}
uploadVideosBackend()
  .then(() => {
    console.log("Uploading video data to backend completed");
  })
  .catch((error) => {
    console.error("Error uploading video data:", error);
  });

module.exports = { uploadVideosBackend };
