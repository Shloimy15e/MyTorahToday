type Props = {
  params: {
    topic: string;
    subtopic: string;
    video_id: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function VideoPage({ params }: Props) {
  try{
    throw new Error("This page was not yet built")
  } catch (error) {
    throw error;
  }
}