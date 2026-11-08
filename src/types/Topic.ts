import Subtopic from "./Subtopic";
import type { DiscoveryRule } from "@/utils/discoveryOrder";
export default interface Topic{
    name: string;
    id: number;
    description: string;
    order?: number;
    discovery_schedule?: DiscoveryRule[];
    subtopics: Subtopic[];
}
