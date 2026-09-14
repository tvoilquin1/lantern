create unique index if not exists vault_chunks_doc_path_heading_key
  on vault_chunks (doc_path, heading);

create or replace function match_vault_chunks(
  query_embedding vector(1024),
  match_count int default 10,
  filter_stage int default null
)
returns table (
  id uuid,
  doc_path text,
  heading text,
  content text,
  stage_scope int[],
  similarity float
)
language sql
stable
as $$
  select
    chunks.id,
    chunks.doc_path,
    chunks.heading,
    chunks.content,
    chunks.stage_scope,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from vault_chunks as chunks
  where chunks.embedding is not null
    and (filter_stage is null or chunks.stage_scope @> array[filter_stage])
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
