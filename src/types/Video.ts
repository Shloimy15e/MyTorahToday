export default interface Video {
  id?: number;
  title: string;
  video_id: (string & { readonly [unique: symbol]: symbol }) | string;
  topic: number;
  tags: string[];
  subtopic: number;
  description: string;
  duration: string;
  publishedAt?: string;
  likes: number;
  views: number;
}
