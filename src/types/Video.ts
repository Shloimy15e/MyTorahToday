export default interface Video {
  id?: number;
  title: string;
  video_id: (string & { readonly [unique: symbol]: symbol }) | string;
  topic: number;
  topic_name: string;
  tags: string[];
  subtopic: number;
  subtopic_name: string;
  description: string;
  duration: string;
  publishedAt?: string;
  likes: number;
  views: number;
}
