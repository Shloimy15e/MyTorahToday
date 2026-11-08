import Video from "./Video";
import type { DiscoveryRule } from "@/utils/discoveryOrder";

export interface Journal {
    id: number;
    title: string;
    pdf: string;
    created_at: string;
}

export default interface Subtopic {
    name: string;
    id: number;
    description: string | null;
    order?: number;
    discovery_schedule?: DiscoveryRule[];
    topic: number;
    topic_name: string;
    sefaria_text: string | null;
    journals: Journal[];
    featured_video?: number | null;
    featured_video_data?: Video | null;
}
