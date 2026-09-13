import { supabase } from '@/lib/supabase/server';
import { embed, rerank } from '@/lib/voyage/client';

import type { RetrievedChunk } from './types';

type MatchVaultChunk = {
  id: string;
  doc_path: string;
  heading: string | null;
  content: string;
  stage_scope: number[] | null;
  similarity: number;
};

export async function retrieve(query: string, stageScope?: number, topK = 3): Promise<RetrievedChunk[]> {
  if (topK <= 0) {
    return [];
  }

  const [queryEmbedding] = await embed([query], 'query');
  const { data: candidates, error } = await supabase.rpc<MatchVaultChunk[]>('match_vault_chunks', {
    query_embedding: queryEmbedding,
    match_count: 10,
    filter_stage: stageScope ?? null,
  });

  if (error) {
    throw new Error(`Vault similarity search failed: ${error.message}`);
  }

  if (!candidates || candidates.length === 0) {
    return [];
  }

  const reranked = await rerank(
    query,
    candidates.map((candidate) => candidate.content),
  );

  return [...reranked]
    .sort((left, right) => right.relevance_score - left.relevance_score)
    .slice(0, topK)
    .map(({ index, relevance_score }) => {
      const candidate = candidates[index];

      if (!candidate) {
        throw new Error(`Voyage rerank returned an invalid candidate index: ${index}`);
      }

      return {
        doc_path: candidate.doc_path,
        heading: candidate.heading,
        content: candidate.content,
        relevance_score,
      };
    });
}
