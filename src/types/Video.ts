export default interface Video {
  id: number;
  title: string;
  video_id: (string & { readonly [unique: symbol]: symbol }) | string;
  topics: number[] | string[];
  topics_data: {
    id: number;
    name: string;
  }[];
  tags: string[];
  subtopics: number[] | string[];
  subtopics_data: {
    id: number;
    name: string;
  }[];
  description: string;
  duration: string;
  publishedAt?: string;
  likes: number;
  userLikes: number;
  views: number;
  userViews: number;
  is_liked_by_user: boolean;
  is_viewed_by_user: boolean;
  is_saved_by_user: boolean;
}
