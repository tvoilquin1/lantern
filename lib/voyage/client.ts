const VOYAGE_API_URL = 'https://api.voyageai.com/v1';
const EMBEDDING_MODEL = 'voyage-3';
const RERANK_MODEL = 'rerank-2';
const EMBEDDING_DIMENSIONS = 1024;

type EmbeddingResponse = {
  data?: Array<{ index: number; embedding: number[] }>;
};

type RerankResponse = {
  data?: Array<{ index: number; relevance_score: number }>;
};

function getApiKey(): string {
  const apiKey = process.env.VOYAGE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('VOYAGE_AI_API_KEY is not configured');
  }

  return apiKey;
}

async function voyageFetch<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${VOYAGE_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.detail ?? payload?.message ?? `Voyage AI request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function embed(
  texts: string[],
  inputType: 'document' | 'query' = 'document',
): Promise<number[][]> {
  const payload = await voyageFetch<EmbeddingResponse>('/embeddings', {
    input: texts,
    model: EMBEDDING_MODEL,
    input_type: inputType,
  });
  const embeddings = [...(payload.data ?? [])].sort((left, right) => left.index - right.index);

  if (embeddings.length !== texts.length || embeddings.some((item) => item.embedding.length !== EMBEDDING_DIMENSIONS)) {
    throw new Error(`Voyage AI returned an unexpected embedding shape; expected ${texts.length} vectors of ${EMBEDDING_DIMENSIONS} dimensions`);
  }

  return embeddings.map((item) => item.embedding);
}

export async function rerank(
  query: string,
  documents: string[],
  topK?: number,
): Promise<{ index: number; relevance_score: number }[]> {
  const payload = await voyageFetch<RerankResponse>('/rerank', {
    query,
    documents,
    model: RERANK_MODEL,
    ...(topK === undefined ? {} : { top_k: topK }),
  });

  return (payload.data ?? []).map(({ index, relevance_score }) => ({ index, relevance_score }));
}
