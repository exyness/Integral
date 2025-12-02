-- Update match_documents to use the HNSW halfvec index
-- We need to cast vectors to halfvec for the index to be used

create or replace function match_documents (
  query_embedding extensions.vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    search_index.id,
    search_index.content,
    search_index.metadata,
    -- Calculate similarity using halfvec for speed (cast both sides)
    1 - (search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)) as similarity
  from search_index
  where auth.uid() = search_index.user_id
    -- Filter using halfvec index
    and 1 - (search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)) > match_threshold
  -- Order using halfvec index
  order by search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)
  limit match_count;
end;
$$;
