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
    topic: number;
    topic_name: string;
    sefaria_text: string | null;
    journals: Journal[];
}