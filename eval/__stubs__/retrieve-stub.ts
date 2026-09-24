type RetrievedChunk = {
  doc_path: string;
  heading: string | null;
  content: string;
  relevance_score: number;
};

let currentMode: 'success' | 'throw' = 'success';
let currentError: Error = new Error('Mock retrieve failure');

export function __setRetrieveBehavior(mode: 'success' | 'throw', error?: Error): void {
  currentMode = mode;
  if (error !== undefined) currentError = error;
}

export async function retrieve(
  _query: string,
  _stageScope?: number,
  _topK = 3,
): Promise<RetrievedChunk[]> {
  if (currentMode === 'throw') {
    throw currentError;
  }
  return [
    {
      doc_path: 'stages/01 - Early stage.md',
      heading: null,
      content: 'During the early stage, caregivers may notice memory lapses.',
      relevance_score: 0.9,
    },
  ];
}
