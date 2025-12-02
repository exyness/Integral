-- Add HNSW index for faster vector similarity search
-- Using halfvec for 3072-dimension vectors (50% storage savings)
-- Explicitly using extensions schema to ensure type is found

-- Create HNSW index on search_index table using halfvec
-- We cast the vector column to halfvec for the index
CREATE INDEX search_index_embedding_hnsw_idx ON search_index 
USING hnsw ((embedding::extensions.halfvec(3072)) extensions.halfvec_cosine_ops);

-- Note: The index will be used automatically when we query with:
-- ORDER BY embedding::extensions.halfvec(3072) <#> query_embedding::extensions.halfvec(3072)
