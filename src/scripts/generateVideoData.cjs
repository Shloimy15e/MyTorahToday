const path = require("path");
const fs = require("fs");
const signature =
  "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";

/**
 * This module fetches all videos from TorahToday channel and returns
 * an array of Video objects and generates a videoData array in the videoData module.
 * If videos are present then it just updates them with new likes and views values
 */

async function fetchVideoData() {
  console.log("Fetching video data...");
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!channelId || !apiKey) {
    console.error("Missing YouTube API credentials");
    return [];
  }

  try {
    /*
    // Step 1: Fetch channels uploads playlist ID:
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    )

    const channelData = await response.json();
    console.log("Fetched channel data:", JSON.stringify(channelData));
    //ID returned was - UUDo54orpThDBi9R7WobzDGg
    */
    // Channels uploads playlist ID
    const uploadsPlaylistId = "UUDo54orpThDBi9R7WobzDGg";

    let allVideoIds = [];
    let nextPageToken = "";
    do {
      // Step 1: Fetch all video IDs from the uploads playlist
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}&pageToken=${nextPageToken}`
      );

      const playlistData = await playlistResponse.json();
      // Video IDs from the uploads playlist
      if (playlistData.items && Array.isArray(playlistData.items)) {
        allVideoIds = allVideoIds.concat(
          playlistData.items.map((item) => item.snippet.resourceId.videoId)
        );
      } else {
        console.error("No video data found");
        console.log(JSON.stringify(playlistData));
        return [];
      }
      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    // Step 2: Format videoIds for API call
    const videoIds = allVideoIds.join(",");

    console.log("Fetched video IDs:", videoIds);

    let startIndex = 0;
    const batchSize = 50;
    let allVideoData = [];
    do {
      const endIndex = Math.min(startIndex + batchSize, videoIds.length);
      const currentBatch = videoIds.slice(startIndex, endIndex);
      // Step 3: Fetch video data for first 50 videos as mentioned in the videoIds array
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${currentBatch}&key=${apiKey}&fields=items(id,snippet(title,description,publishedAt,tags),statistics(viewCount,likeCount),contentDetails(duration))&part=snippet,statistics,contentDetails`
      );
      const videoResponseData = await videoResponse.json();

      allVideoData = allVideoData.concat(videoResponseData.items);
      startIndex += batchSize;
    } while (startIndex < videoIds.length);

    const videoData = { items: allVideoData };
    return videoData.items.map((item) => ({
      //id: index + 1; // - removed for now.
      title: item.snippet.title,
      video_id: item.id,
      topic: "Parshah",
      subtopic: "Balak",
      tags: [""],
      description: item.snippet.description
        .toLowerCase()
        .startsWith("subscribe")
        ? signature
        : item.snippet.description,
      duration: item.contentDetails.duration,
      publishedAt: item.snippet.publishedAt,
      likes: Number(item.statistics.likeCount),
      views: Number(item.statistics.viewCount),
    }));
  } catch (error) {
    console.error("Error fetching video data:", error);
    throw new Error("Error fetching video data " + error);
  }
}

const generateVideoData = async () => {
  console.log("Generating video data...");
  /*
  try {
    const videoData = await fetchVideoData();
    console.log("Video data fetched successfully");
    console.log("amount of videos: ", videoData.length);

    // Check if videoData is more than 0
    if (videoData.length === 0) {
      console.error("No videos found");
      return;
    }

    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "newVideoData.json"
    );

    // Get videoData from file
    const existingVideoData = fs.readFileSync(filePath, "utf-8");
    /* OLD CODE
    // Extract the exported videoData array
    const existingVideos = existingVideoData.match(
      /export const videoData: Video\[\] = (.*?);/
    )?.[1];*/

  // Look in JSON if it has videoData if yes it should have an object: {"videos":[]}
  //let existingVideos = false;
  /*try {
      const parsedData = JSON.parse(existingVideoData);
      if (
        parsedData &&
        Array.isArray(parsedData.videos) &&
        parsedData.videos.length > 0
      ) {
        existingVideos = parsedData.videos;
      }
    } catch (error) {
      console.error("Error parsing existing video data:", error);
    }*/

  // Update the videoData file with new videoData
  //if (existingVideos) {
  /* Old code
      const newVideoData = videoData.map((video) => {
        const existingVideo = JSON.parse(existingVideos).find(
          (v) => v.id === video.id
        );
        return existingVideo
          ? { ...existingVideo, ...video }
          : { ...video};
      });
      const existingContent = fs.readFileSync(filePath, "utf8");
      const updatedContent = existingContent.replace(
        /export const videoData: Video\[] = \[[\s\S]*?\];/,
        `export const videoData: Video[] = ${JSON.stringify(newVideoData)};`
      );
      fs.writeFileSync(filePath, updatedContent);
      return newVideoData;
      // New System - generate/update a JSON file wich is { "videos":[...videos]}
      // Find videos in file with same video_id and update their likes and views
      const newVideoData = videoData.map((video) => {
        const existingVideo = existingVideos.find(
          (v) => v.video_id === video.video_id
        );
        return existingVideo
          ? { ...existingVideo, likes: video.likes, views: video.views }
          : { ...video };
      });

      const newVideoDataJSON = JSON.stringify({ videos: newVideoData });
      fs.writeFileSync(filePath, newVideoDataJSON);
      try {
        const response = await fetch("https://mttbackend-production.up.railway.app/api/videos/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: newVideoDataJSON,
        });
        const data = await response.json();
        if (data.error) {
          console.error("Error updating videos: ", data.error);
          throw new Error("Error updating videos " + data.error);
        }
        console.log("Videos updated successfully: ", data);
      } catch (error) {
        console.error("Error updating videos: ", error);
        throw new Error("Error updating videos " + error);
      }
    } else {
      /* Old code
      const existingData = fs.readFileSync(filePath, "utf8");
      const updatedData = existingData.replace(
        /export const videoData: Video\[\] = \[.*?\];/s,
        `export const videoData: Video[] = ${JSON.stringify(videoData)};`
      );
      fs.writeFileSync(filePath, updatedData);
      // New System - generate a JSON file wich is { "videos":[...videos]}
      const newVideoDataJSON = JSON.stringify({ videos: videoData });
      fs.writeFileSync(filePath, newVideoDataJSON);
      */
  try {
    const filepath = path.join(
      process.cwd(),
      "src",
      "data",
      "newVideoData.json"
    );
    const newVideoDataJSON = fs.readFileSync(filepath, "utf8");
    console.log("newVideoDataJSON: ", newVideoDataJSON.slice(0, 1000));
    const response = await fetch(
      "https://mttbackend-production.up.railway.app/api/videos/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: newVideoDataJSON,
      }
    );
    console.log("Response: ", response);
    if (!response.ok) {
      console.error("Error updating videos: ", response.error);
      throw new Error(
        "Error updating videos " + response.error + "Response: " + response
      );
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Error parsing JSON response " + error);
    }
    console.log("Videos updated successfully: ", data);
  } catch (error) {
    console.error("Error updating videos: ", error);
    //throw new Error("Error updating videos " + error);
  }
  /*
  } catch (error) {
    console.error("Error generating video data:", error);
    throw new Error("Error generating video data " + error);
  }*/
};
generateVideoData().then(() => console.log("Video data generation complete"));

module.exports = { generateVideoData };
