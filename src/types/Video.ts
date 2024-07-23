export default interface Video {
    id: number;
    title: string;
    video_id: string;
    topic: string;
    tags: string[];
    subtopic: string;
    description: string;
    duration: string;
    publishedAt?: string;
    likes: number;
    views: number;
  }