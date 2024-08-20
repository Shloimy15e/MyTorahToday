import Subtopic from "./Subtopic";
export default interface Topic{
    name: string;
    id: number;
    description: string;
    subtopics: Subtopic[];
}