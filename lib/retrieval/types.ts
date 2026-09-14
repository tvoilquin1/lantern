export type RetrievedChunk = {
  doc_path: string;
  heading: string | null;
  content: string;
  relevance_score: number;
};
