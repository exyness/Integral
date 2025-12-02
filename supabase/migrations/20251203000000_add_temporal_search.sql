-- Add date filtering support to vector search
-- This allows RAG to filter by date ranges for temporal queries

-- First, ensure we have a date extraction function for metadata
CREATE OR REPLACE FUNCTION extract_metadata_date(metadata jsonb, key text)
RETURNS timestamptz AS $$
BEGIN
  RETURN (metadata->>key)::timestamptz;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced match_documents with optional date filtering
CREATE OR REPLACE FUNCTION match_documents_with_date_filter(
  query_embedding extensions.vector(3072),
  match_threshold float,
  match_count int,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    search_index.id,
    search_index.content,
    search_index.metadata,
    1 - (search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)) as similarity
  FROM search_index
  WHERE auth.uid() = search_index.user_id
    -- Similarity threshold
    AND 1 - (search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)) > match_threshold
    -- Date filtering (if provided)
    AND (
      -- If no date filter, include everything
      (start_date IS NULL AND end_date IS NULL)
      OR
      -- Check due_date for tasks
      (
        extract_metadata_date(search_index.metadata, 'due_date') IS NOT NULL
        AND extract_metadata_date(search_index.metadata, 'due_date') >= start_date
        AND extract_metadata_date(search_index.metadata, 'due_date') <= end_date
      )
      OR
      -- Check entry_date for journal entries
      (
        extract_metadata_date(search_index.metadata, 'entry_date') IS NOT NULL
        AND extract_metadata_date(search_index.metadata, 'entry_date') >= start_date
        AND extract_metadata_date(search_index.metadata, 'entry_date') <= end_date
      )
      OR
      -- Check created_at for notes
      (
        extract_metadata_date(search_index.metadata, 'created_at') IS NOT NULL
        AND extract_metadata_date(search_index.metadata, 'created_at') >= start_date
        AND extract_metadata_date(search_index.metadata, 'created_at') <= end_date
      )
    )
  ORDER BY search_index.embedding::extensions.halfvec(3072) <=> query_embedding::extensions.halfvec(3072)
  LIMIT match_count;
END;
$$;

-- Create index on metadata for faster date filtering
CREATE INDEX IF NOT EXISTS idx_search_index_metadata_dates 
ON search_index USING gin ((metadata));
